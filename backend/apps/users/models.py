from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    AUTH_PROVIDER_CHOICES = [
        ("email", "Email"),
        ("google", "Google"),
        ("github", "GitHub"),
    ]

    email = models.EmailField(unique=True)
    avatar_url = models.URLField(blank=True, null=True)
    auth_provider = models.CharField(max_length=20, choices=AUTH_PROVIDER_CHOICES, default="email")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self) -> str:
        return self.email