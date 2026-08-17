from django.conf import settings
from django.db import models


class QrTemplate(models.Model):
    DOT_STYLE_CHOICES = [
        ("square", "Square"),
        ("rounded", "Rounded"),
        ("dots", "Dots"),
    ]
    ERROR_CORRECTION_CHOICES = [
        ("L", "Low"),
        ("M", "Medium"),
        ("Q", "Quartile"),
        ("H", "High"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="templates")
    name = models.CharField(max_length=100)
    fg_color = models.CharField(max_length=7, default="#000000")
    bg_color = models.CharField(max_length=7, default="#FFFFFF")
    logo_image = models.ImageField(upload_to="logos/", blank=True, null=True)
    dot_style = models.CharField(max_length=20, choices=DOT_STYLE_CHOICES, default="square")
    error_correction = models.CharField(max_length=1, choices=ERROR_CORRECTION_CHOICES, default="H")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return self.name