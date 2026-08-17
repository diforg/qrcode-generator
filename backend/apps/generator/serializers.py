import re

from rest_framework import serializers

from .models import QrGenerationHistory


HEX_COLOR_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")


class GenerateQrRequestSerializer(serializers.Serializer):
    target_url = serializers.URLField()
    fg_color = serializers.CharField(default="#111827")
    bg_color = serializers.CharField(default="#FFFFFF")
    dot_style = serializers.ChoiceField(choices=["square", "rounded", "dots"], default="square")
    error_correction = serializers.ChoiceField(choices=["L", "M", "Q", "H"], default="M")
    logo_base64 = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    export_format = serializers.ChoiceField(choices=["PNG", "SVG"], default="PNG")
    resolution = serializers.IntegerField(min_value=256, max_value=4096, default=1024)
    template_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_fg_color(self, value: str) -> str:
        if not HEX_COLOR_RE.match(value):
            raise serializers.ValidationError("Informe uma cor hexadecimal valida.")
        return value

    def validate_bg_color(self, value: str) -> str:
        if not HEX_COLOR_RE.match(value):
            raise serializers.ValidationError("Informe uma cor hexadecimal valida.")
        return value

    def validate_logo_base64(self, value: str | None) -> str | None:
        if not value:
            return None
        if not value.startswith("data:image/") or "," not in value:
            raise serializers.ValidationError("O logo deve ser enviado como data URL base64.")
        return value


class QrGenerationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = QrGenerationHistory
        fields = (
            "id",
            "target_url",
            "fg_color",
            "bg_color",
            "has_logo",
            "export_format",
            "resolution",
            "created_at",
        )