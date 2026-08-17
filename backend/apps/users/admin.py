from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Perfil",
            {
                "fields": ("avatar_url", "auth_provider", "created_at", "updated_at"),
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at")
    list_display = ("email", "username", "auth_provider", "is_staff", "is_active")