from rest_framework import serializers

from .models import QrTemplate


class QrTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QrTemplate
        fields = (
            "id",
            "name",
            "fg_color",
            "bg_color",
            "logo_image",
            "dot_style",
            "error_correction",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("O nome do template nao pode estar vazio.")
        return value.strip()

    def validate_fg_color(self, value):
        if value and not value.startswith("#"):
            raise serializers.ValidationError("Informe uma cor hexadecimal valida.")
        return value

    def validate_bg_color(self, value):
        if value and not value.startswith("#"):
            raise serializers.ValidationError("Informe uma cor hexadecimal valida.")
        return value
