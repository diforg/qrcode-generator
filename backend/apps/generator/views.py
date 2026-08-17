from django.http import FileResponse
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import QrGenerationHistory
from .serializers import GenerateQrRequestSerializer, QrGenerationHistorySerializer
from .services.export import ExportService
from .services.logo_overlay import LogoOverlayService
from .services.qr_builder import QrBuilderService


class PreviewQrView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GenerateQrRequestSerializer(data={**request.data, "export_format": "PNG"})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        error_correction = "H" if data.get("logo_base64") else data["error_correction"]

        qr_image = QrBuilderService.build_png(
            data=data["target_url"],
            fg_color=data["fg_color"],
            bg_color=data["bg_color"],
            error_correction=error_correction,
            dot_style=data["dot_style"],
        )

        if data.get("logo_base64"):
            qr_image = LogoOverlayService.apply_to_png(qr_image, data["logo_base64"])

        return Response({"image": ExportService.to_base64_png(qr_image, 768)})


class GenerateQrView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GenerateQrRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        error_correction = "H" if data.get("logo_base64") else data["error_correction"]

        if data["export_format"] == "SVG":
            buffer, content_type, filename = self._build_svg_response(data, error_correction)
        else:
            buffer, content_type, filename = self._build_png_response(data, error_correction)

        if request.user.is_authenticated:
            QrGenerationHistory.objects.create(
                user=request.user,
                template_id=data.get("template_id"),
                target_url=data["target_url"],
                fg_color=data["fg_color"],
                bg_color=data["bg_color"],
                has_logo=bool(data.get("logo_base64")),
                export_format=data["export_format"],
                resolution=data["resolution"],
            )

        return FileResponse(buffer, as_attachment=True, filename=filename, content_type=content_type)

    def _build_png_response(self, data, error_correction):
        qr_image = QrBuilderService.build_png(
            data=data["target_url"],
            fg_color=data["fg_color"],
            bg_color=data["bg_color"],
            error_correction=error_correction,
            dot_style=data["dot_style"],
        )
        if data.get("logo_base64"):
            qr_image = LogoOverlayService.apply_to_png(qr_image, data["logo_base64"])
        return ExportService.to_png_buffer(qr_image, data["resolution"])

    def _build_svg_response(self, data, error_correction):
        svg_bytes = QrBuilderService.build_svg(
            data=data["target_url"],
            fg_color=data["fg_color"],
            bg_color=data["bg_color"],
            error_correction=error_correction,
        )
        if data.get("logo_base64"):
            svg_bytes = LogoOverlayService.apply_to_svg(svg_bytes, data["logo_base64"])
        return ExportService.to_svg_buffer(svg_bytes)


class GenerationHistoryListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QrGenerationHistorySerializer

    def get_queryset(self):
        return QrGenerationHistory.objects.filter(user=self.request.user)


class GenerationHistoryDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = QrGenerationHistorySerializer

    def get_queryset(self):
        return QrGenerationHistory.objects.filter(user=self.request.user)

    def delete(self, request, *args, **kwargs):
        super().delete(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)