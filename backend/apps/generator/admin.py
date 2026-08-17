from django.contrib import admin

from .models import QrGenerationHistory


@admin.register(QrGenerationHistory)
class QrGenerationHistoryAdmin(admin.ModelAdmin):
    list_display = ("target_url", "user", "export_format", "has_logo", "created_at")
    list_filter = ("export_format", "has_logo")
    search_fields = ("target_url", "user__email")