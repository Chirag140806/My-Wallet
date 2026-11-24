from datetime import date

from django.db.models import Q, Sum
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .constants import EXPENSE_CATEGORIES, INCOME_CATEGORIES
from .models import Budget, Transaction
from .serializers import BudgetSerializer, TransactionSerializer
from .utils import (
    MONTH_NAMES, budget_status, category_breakdown, last_n_months,
    month_totals, monthly_series, shift_month, to_float,
)


class TransactionViewSet(viewsets.ModelViewSet):
    """
    list / create / retrieve / update / delete transactions.
    Every query starts with `user=request.user`, so users only see their own data.
    """

    serializer_class = TransactionSerializer

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user)
        params = self.request.query_params

        search = params.get("search")
        if search:
            qs = qs.filter(Q(description__icontains=search) | Q(category__icontains=search))
        if params.get("type") in (Transaction.INCOME, Transaction.EXPENSE):
            qs = qs.filter(type=params["type"])
        if params.get("category"):
            qs = qs.filter(category=params["category"])
        if params.get("start"):
            qs = qs.filter(date__gte=params["start"])
        if params.get("end"):
            qs = qs.filter(date__lte=params["end"])
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(["GET"])
def categories(request):
    return Response({"income": INCOME_CATEGORIES, "expense": EXPENSE_CATEGORIES})


def _parse_month_year(request):
    today = date.today()
    try:
        month = int(request.query_params.get("month", today.month))
        year = int(request.query_params.get("year", today.year))
    except ValueError:
        month, year = today.month, today.year
    if not 1 <= month <= 12:
        month = today.month
    return month, year


def _budget_payload(user, year, month):
    budget = Budget.objects.filter(user=user, year=year, month=month).first()
    _, spent = month_totals(user, year, month)
    amount = to_float(budget.amount) if budget else None
    percent, status = budget_status(amount, spent)
    return {
        "month": month,
        "year": year,
        "amount": amount,
        "spent": spent,
        "remaining": round(amount - spent, 2) if amount else None,
        "percent": percent,
        "status": status,
    }


@api_view(["GET", "POST"])
def budgets(request):
    """
    GET  /api/budgets/?month=&year=  -> budget + spending of that month + recent history
    POST /api/budgets/               -> create or update the budget of a month
    """
    if request.method == "POST":
        serializer = BudgetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        Budget.objects.update_or_create(
            user=request.user, month=data["month"], year=data["year"],
            defaults={"amount": data["amount"]},
        )
        return Response(_budget_payload(request.user, data["year"], data["month"]), status=201)

    month, year = _parse_month_year(request)
    payload = _budget_payload(request.user, year, month)
    payload["history"] = [
        {**_budget_payload(request.user, y, m), "label": f"{MONTH_NAMES[m - 1]} {y}"}
        for y, m in reversed(last_n_months(6))
    ]
    return Response(payload)


@api_view(["GET"])
def dashboard(request):
    user = request.user
    today = date.today()
    all_tx = Transaction.objects.filter(user=user)

    total_income = to_float(all_tx.filter(type="income").aggregate(t=Sum("amount"))["t"])
    total_expense = to_float(all_tx.filter(type="expense").aggregate(t=Sum("amount"))["t"])

    month_income, month_expense = month_totals(user, today.year, today.month)
    budget = _budget_payload(user, today.year, today.month)

    month_qs = all_tx.filter(date__year=today.year, date__month=today.month)
    recent = TransactionSerializer(all_tx[:6], many=True).data

    return Response({
        "total_balance": round(total_income - total_expense, 2),
        "total_income": total_income,
        "total_expense": total_expense,
        "month": today.month,
        "year": today.year,
        "month_income": month_income,
        "month_expense": month_expense,
        "budget": budget,
        "monthly_spending": monthly_series(user, 6),
        "category_breakdown": category_breakdown(month_qs),
        "recent_transactions": recent,
        "transaction_count": all_tx.count(),
    })


@api_view(["GET"])
def analytics(request):
    user = request.user
    try:
        months = int(request.query_params.get("months", 6))
    except ValueError:
        months = 6
    months = 12 if months > 6 else 6

    series = monthly_series(user, months)
    first_year, first_month = last_n_months(months)[0]
    window = Transaction.objects.filter(user=user).filter(
        Q(date__year__gt=first_year) | Q(date__year=first_year, date__month__gte=first_month)
    )
    categories_data = category_breakdown(window)

    total_income = sum(r["income"] for r in series)
    total_expense = sum(r["expense"] for r in series)
    active_months = [r for r in series if r["expense"] > 0]
    highest = max(series, key=lambda r: r["expense"]) if active_months else None

    return Response({
        "months": months,
        "monthly": series,
        "categories": categories_data,
        "summary": {
            "total_income": round(total_income, 2),
            "total_expense": round(total_expense, 2),
            "net_savings": round(total_income - total_expense, 2),
            "savings_rate": round((total_income - total_expense) / total_income * 100, 1) if total_income else 0,
            "avg_monthly_expense": round(total_expense / len(active_months), 2) if active_months else 0,
            "top_category": categories_data[0]["category"] if categories_data else None,
            "highest_month": highest["label"] if highest else None,
        },
    })
