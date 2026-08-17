from django.conf import settings
from django.db import models

from apps.templates_qr.models import QrTemplate


class QrGenerationHistory(models.Model):
    FORMAT_CHOICES = [("PNG", "PNG"), ("SVG", "SVG")]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="generation_history",
        null=True,
        blank=True,
    )
    template = models.ForeignKey(QrTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    target_url = models.URLField()
    fg_color = models.CharField(max_length=7)
    bg_color = models.CharField(max_length=7)
    has_logo = models.BooleanField(default=False)
    export_format = models.CharField(max_length=3, choices=FORMAT_CHOICES, default="PNG")
    resolution = models.PositiveIntegerField(default=1024)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.target_url} ({self.export_format})"