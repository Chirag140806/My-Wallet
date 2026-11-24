from datetime import date

from django.contrib.auth.models import User
from rest_framework.test import APITestCase


class MyWalletApiTests(APITestCase):
    def register(self, email="a@test.com", password="secret123"):
        res = self.client.post("/api/auth/register/", {
            "first_name": "Test", "email": email, "password": password}, format="json")
        self.assertEqual(res.status_code, 201, res.data)
        return res.data["token"]

    def auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

    def test_register_login_logout(self):
        self.register()
        res = self.client.post("/api/auth/login/", {"email": "a@test.com", "password": "secret123"}, format="json")
        self.assertEqual(res.status_code, 200)
        bad = self.client.post("/api/auth/login/", {"email": "a@test.com", "password": "wrong"}, format="json")
        self.assertEqual(bad.status_code, 400)
        self.auth(res.data["token"])
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 200)
        self.assertEqual(self.client.get("/api/auth/profile/").status_code, 401)

    def test_password_is_hashed_and_duplicate_email_rejected(self):
        self.register()
        self.assertNotEqual(User.objects.get(username="a@test.com").password, "secret123")
        res = self.client.post("/api/auth/register/", {
            "first_name": "X", "email": "A@test.com", "password": "secret123"}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_transaction_crud_and_filters(self):
        self.auth(self.register())
        today = date.today().isoformat()
        res = self.client.post("/api/transactions/", {
            "type": "expense", "amount": "250.50", "category": "Food",
            "description": "Lunch", "date": today}, format="json")
        self.assertEqual(res.status_code, 201, res.data)
        tid = res.data["id"]
        self.client.post("/api/transactions/", {
            "type": "income", "amount": "1000", "category": "Salary", "date": today}, format="json")

        self.assertEqual(len(self.client.get("/api/transactions/").data), 2)
        self.assertEqual(len(self.client.get("/api/transactions/?type=income").data), 1)
        self.assertEqual(len(self.client.get("/api/transactions/?search=lunch").data), 1)
        self.assertEqual(len(self.client.get("/api/transactions/?category=Food").data), 1)

        res = self.client.put(f"/api/transactions/{tid}/", {
            "type": "expense", "amount": "300", "category": "Food",
            "description": "Big lunch", "date": today}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["amount"], "300.00")

        self.assertEqual(self.client.delete(f"/api/transactions/{tid}/").status_code, 204)
        self.assertEqual(len(self.client.get("/api/transactions/").data), 1)

    def test_validation(self):
        self.auth(self.register())
        bad_amount = self.client.post("/api/transactions/", {
            "type": "expense", "amount": "-5", "category": "Food", "date": "2025-01-01"}, format="json")
        self.assertEqual(bad_amount.status_code, 400)
        bad_cat = self.client.post("/api/transactions/", {
            "type": "expense", "amount": "5", "category": "Salary", "date": "2025-01-01"}, format="json")
        self.assertEqual(bad_cat.status_code, 400)

    def test_users_cannot_see_each_others_data(self):
        t1 = self.register("one@test.com")
        t2 = self.register("two@test.com")
        self.auth(t1)
        res = self.client.post("/api/transactions/", {
            "type": "expense", "amount": "10", "category": "Food", "date": "2025-01-01"}, format="json")
        tid = res.data["id"]
        self.auth(t2)
        self.assertEqual(len(self.client.get("/api/transactions/").data), 0)
        self.assertEqual(self.client.get(f"/api/transactions/{tid}/").status_code, 404)
        self.assertEqual(self.client.delete(f"/api/transactions/{tid}/").status_code, 404)

    def test_budget_and_dashboard(self):
        self.auth(self.register())
        today = date.today()
        self.client.post("/api/transactions/", {
            "type": "income", "amount": "5000", "category": "Salary", "date": today.isoformat()}, format="json")
        self.client.post("/api/transactions/", {
            "type": "expense", "amount": "900", "category": "Food", "date": today.isoformat()}, format="json")

        res = self.client.post("/api/budgets/", {"month": today.month, "year": today.year, "amount": "1000"}, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["status"], "warning")
        # updating the same month should not create a second budget
        res = self.client.post("/api/budgets/", {"month": today.month, "year": today.year, "amount": "800"}, format="json")
        self.assertEqual(res.data["status"], "exceeded")
        self.assertEqual(res.data["remaining"], -100.0)

        dash = self.client.get("/api/dashboard/").data
        self.assertEqual(dash["total_balance"], 4100.0)
        self.assertEqual(dash["total_income"], 5000.0)
        self.assertEqual(dash["total_expense"], 900.0)
        self.assertEqual(dash["category_breakdown"][0]["category"], "Food")
        self.assertEqual(len(dash["monthly_spending"]), 6)

        an = self.client.get("/api/analytics/?months=12").data
        self.assertEqual(len(an["monthly"]), 12)
        self.assertEqual(an["summary"]["top_category"], "Food")
