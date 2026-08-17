from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class TemplateApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="templateuser",
            email="template@example.com",
            password="StrongPass123!",
        )
        self.client.force_authenticate(user=self.user)

    def test_history_includes_template_reference_for_generated_qr(self):
        template = self.user.templates.create(
            name="Saved Template",
            fg_color="#111111",
            bg_color="#eeeeee",
            dot_style="rounded",
            error_correction="H",
        )

        response = self.client.post(
            reverse("qr-generate"),
            {
                "target_url": "https://example.com",
                "fg_color": "#111111",
                "bg_color": "#eeeeee",
                "dot_style": "rounded",
                "error_correction": "H",
                "template_id": template.id,
                "export_format": "PNG",
                "resolution": 512,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        history_response = self.client.get(reverse("qr-history"), format="json")

        self.assertEqual(history_response.status_code, status.HTTP_200_OK)
        self.assertEqual(history_response.data["results"][0]["template_id"], template.id)

    def test_create_template(self):
        payload = {
            "name": "Template Demo",
            "fg_color": "#111827",
            "bg_color": "#FFFFFF",
            "dot_style": "rounded",
            "error_correction": "H",
        }

        response = self.client.post(reverse("templates-list-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Template Demo")
        self.assertEqual(response.data["dot_style"], "rounded")

    def test_list_templates_returns_only_user_templates(self):
        self.user.templates.create(
            name="Owned Template",
            fg_color="#111111",
            bg_color="#eeeeee",
            dot_style="square",
            error_correction="M",
        )

        response = self.client.get(reverse("templates-list-create"), format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["name"], "Owned Template")

    def test_update_template(self):
        template = self.user.templates.create(
            name="Old Name",
            fg_color="#111111",
            bg_color="#eeeeee",
            dot_style="square",
            error_correction="M",
        )

        response = self.client.patch(reverse("templates-detail", args=[template.id]), {"name": "New Name"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "New Name")
