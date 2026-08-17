from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    SocialLoginSerializer,
    UserSerializer,
)


User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login_serializer = LoginSerializer(data={"email": user.email, "password": request.data["password"]})
        login_serializer.is_valid(raise_exception=True)
        tokens = login_serializer.get_tokens(user)
        return Response({"user": UserSerializer(user).data, "tokens": tokens}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        tokens = serializer.get_tokens(user)
        return Response({"user": UserSerializer(user).data, **tokens})


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            return Response({"message": "Se a conta existir, as instrucoes de recuperacao foram geradas.", "uid": uid, "token": token})

        return Response({"message": "Se a conta existir, as instrucoes de recuperacao foram geradas."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token = serializer.validated_data["token"]

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Token de recuperacao invalido."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"message": "Senha atualizada com sucesso."}, status=status.HTTP_200_OK)


class SocialLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, provider=None):
        payload = request.data.copy()
        if provider:
            payload["provider"] = provider
        serializer = SocialLoginSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        tokens = LoginSerializer().get_tokens(user)
        return Response({"user": UserSerializer(user).data, **tokens})


class AuthMeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
