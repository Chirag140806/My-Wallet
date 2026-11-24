from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("transactions", views.TransactionViewSet, basename="transaction")

urlpatterns = [
    path("", include(router.urls)),
    path("categories/", views.categories),
    path("budgets/", views.budgets),
    path("dashboard/", views.dashboard),
    path("analytics/", views.analytics),
]
