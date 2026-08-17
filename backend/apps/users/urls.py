from django.urls import path

from .views import (
    AuthMeView,
    LoginView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    SocialLoginView,
)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("me/", AuthMeView.as_view(), name="auth-me"),
    path("password-reset/request/", PasswordResetRequestView.as_view(), name="auth-password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),
    path("social-login/", SocialLoginView.as_view(), name="auth-social-login"),
    path("google/login/", SocialLoginView.as_view(), {"provider": "google"}, name="auth-google-login"),
    path("github/login/", SocialLoginView.as_view(), {"provider": "github"}, name="auth-github-login"),
]
