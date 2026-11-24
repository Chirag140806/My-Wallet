"""Small helper functions used by the dashboard, analytics and budget views."""
from datetime import date
from decimal import Decimal

from django.db.models import Sum

from .models import Budget, Transaction

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def to_float(value):
    return float(value or Decimal("0"))


def shift_month(year, month, delta):
    """Move a (year, month) pair forward/backward by `delta` months."""
    index = year * 12 + (month - 1) + delta
    return index // 12, index % 12 + 1


def month_totals(user, year, month):
    """Total income and expense of one month."""
    qs = Transaction.objects.filter(user=user, date__year=year, date__month=month)
    income = qs.filter(type=Transaction.INCOME).aggregate(t=Sum("amount"))["t"]
    expense = qs.filter(type=Transaction.EXPENSE).aggregate(t=Sum("amount"))["t"]
    return to_float(income), to_float(expense)


def last_n_months(n, today=None):
    """List of (year, month) for the last n months, oldest first."""
    today = today or date.today()
    return [shift_month(today.year, today.month, -i) for i in range(n - 1, -1, -1)]


def monthly_series(user, n):
    """Income / expense / savings / budget for each of the last n months."""
    rows = []
    for year, month in last_n_months(n):
        income, expense = month_totals(user, year, month)
        budget = Budget.objects.filter(user=user, year=year, month=month).first()
        rows.append({
            "year": year,
            "month": month,
            "label": f"{MONTH_NAMES[month - 1]} {str(year)[2:]}",
            "income": income,
            "expense": expense,
            "savings": round(income - expense, 2),
            "budget": to_float(budget.amount) if budget else None,
        })
    return rows


def category_breakdown(queryset):
    """Expense totals per category with percentage share."""
    rows = (
        queryset.filter(type=Transaction.EXPENSE)
        .values("category")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )
    grand_total = sum(to_float(r["total"]) for r in rows)
    return [
        {
            "category": r["category"],
            "total": to_float(r["total"]),
            "percent": round(to_float(r["total"]) / grand_total * 100, 1) if grand_total else 0,
        }
        for r in rows
    ]


def budget_status(amount, spent):
    """Return (percent used, status text) for a budget."""
    if not amount:
        return 0, "none"
    percent = round(spent / amount * 100, 1)
    if percent > 100:
        return percent, "exceeded"
    if percent >= 80:
        return percent, "warning"
    return percent, "ok"
