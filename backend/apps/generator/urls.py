from django.urls import path

from .views import GenerateQrView, GenerationHistoryDeleteView, GenerationHistoryListView, PreviewQrView


urlpatterns = [
    path("preview/", PreviewQrView.as_view(), name="qr-preview"),
    path("generate/", GenerateQrView.as_view(), name="qr-generate"),
    path("history/", GenerationHistoryListView.as_view(), name="qr-history"),
    path("history/<int:pk>/", GenerationHistoryDeleteView.as_view(), name="qr-history-delete"),
]