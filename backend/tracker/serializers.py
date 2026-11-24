from decimal import Decimal

from rest_framework import serializers

from .constants import EXPENSE_CATEGORIES, INCOME_CATEGORIES
from .models import Budget, Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "type", "amount", "category", "description", "date", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_amount(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate(self, data):
        # On partial updates fall back to the existing values.
        t_type = data.get("type", getattr(self.instance, "type", None))
        category = data.get("category", getattr(self.instance, "category", None))
        allowed = INCOME_CATEGORIES if t_type == Transaction.INCOME else EXPENSE_CATEGORIES
        if category not in allowed:
            raise serializers.ValidationError({"category": f"Choose a valid {t_type} category."})
        return data


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ["id", "month", "year", "amount"]

    def validate_month(self, value):
        if not 1 <= value <= 12:
            raise serializers.ValidationError("Month must be between 1 and 12.")
        return value

    def validate_amount(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError("Budget must be greater than zero.")
        return value
