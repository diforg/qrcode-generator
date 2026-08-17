from django.urls import path

from .views import QrTemplateDetailView, QrTemplateListCreateView


urlpatterns = [
    path("", QrTemplateListCreateView.as_view(), name="templates-list-create"),
    path("<int:pk>/", QrTemplateDetailView.as_view(), name="templates-detail"),
]
