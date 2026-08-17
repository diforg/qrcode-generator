from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import QrTemplate
from .serializers import QrTemplateSerializer


class QrTemplateListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QrTemplateSerializer

    def get_queryset(self):
        return QrTemplate.objects.filter(user=self.request.user).order_by("-updated_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class QrTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QrTemplateSerializer

    def get_queryset(self):
        return QrTemplate.objects.filter(user=self.request.user)
