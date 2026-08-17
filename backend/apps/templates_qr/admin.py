from django.contrib import admin

from .models import QrTemplate


@admin.register(QrTemplate)
class QrTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "dot_style", "error_correction", "updated_at")
    search_fields = ("name", "user__email")