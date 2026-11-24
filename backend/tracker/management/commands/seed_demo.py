"""
Optional demo data.  Run:  python manage.py seed_demo
Creates a SEPARATE demo account (demo@mywallet.com / Demo@1234) so that
demo data never mixes with real user data.  Run with --reset to rebuild it.
"""
import random
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from tracker.models import Budget, Transaction
from tracker.utils import last_n_months

DEMO_EMAIL = "demo@mywallet.com"


class Command(BaseCommand):
    help = "Create a demo account with sample transactions."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="delete the old demo data first")

    def handle(self, *args, **options):
        if options["reset"]:
            User.objects.filter(username=DEMO_EMAIL).delete()

        user, created = User.objects.get_or_create(
            username=DEMO_EMAIL,
            defaults={"email": DEMO_EMAIL, "first_name": "Demo", "last_name": "User"},
        )
        if not created:
            self.stdout.write("Demo user already exists. Use --reset to rebuild it.")
            return
        user.set_password("Demo@1234")
        user.save()

        rnd = random.Random(42)
        expense_plan = {
            "Food": (150, 900), "Transport": (50, 400), "Shopping": (300, 3000),
            "Bills": (400, 2500), "Health": (200, 1500), "Entertainment": (150, 1200),
            "Education": (500, 2500), "Rent": (8000, 8000),
        }
        for year, month in last_n_months(6):
            Transaction.objects.create(user=user, type="income", amount=rnd.randint(38000, 45000),
                                       category="Salary", description="Monthly salary",
                                       date=date(year, month, 1))
            if rnd.random() > 0.4:
                Transaction.objects.create(user=user, type="income", amount=rnd.randint(3000, 9000),
                                           category="Freelance", description="Freelance project",
                                           date=date(year, month, 15))
            Transaction.objects.create(user=user, type="expense", amount=8000, category="Rent",
                                       description="House rent", date=date(year, month, 2))
            for _ in range(rnd.randint(9, 13)):
                category = rnd.choice([c for c in expense_plan if c != "Rent"])
                low, high = expense_plan[category]
                Transaction.objects.create(
                    user=user, type="expense", amount=rnd.randint(low, high), category=category,
                    description=f"{category} expense",
                    date=date(year, month, rnd.randint(3, 27)),
                )
            Budget.objects.create(user=user, year=year, month=month, amount=rnd.choice([24000, 26000, 28000]))

        self.stdout.write(self.style.SUCCESS(
            f"Demo data created. Login with {DEMO_EMAIL} / Demo@1234"))
