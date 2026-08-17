from django.urls import path

from .views import AuthMeView, LoginView, RegisterView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("me/", AuthMeView.as_view(), name="auth-me"),
]
