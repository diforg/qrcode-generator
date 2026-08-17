import base64
import io

from PIL import Image, ImageOps


class LogoOverlayService:
    @staticmethod
    def _load_logo(logo_base64: str) -> Image.Image:
        _, encoded = logo_base64.split(",", 1)
        decoded = base64.b64decode(encoded)
        return Image.open(io.BytesIO(decoded)).convert("RGBA")

    @classmethod
    def apply_to_png(cls, qr_image: Image.Image, logo_base64: str) -> Image.Image:
        logo = cls._load_logo(logo_base64)
        max_logo_size = int(qr_image.width * 0.24)
        logo.thumbnail((max_logo_size, max_logo_size), Image.LANCZOS)

        padded_logo = ImageOps.expand(logo, border=max(8, qr_image.width // 45), fill="white")
        x_pos = (qr_image.width - padded_logo.width) // 2
        y_pos = (qr_image.height - padded_logo.height) // 2

        result = qr_image.copy()
        result.paste(padded_logo, (x_pos, y_pos), padded_logo)
        return result

    @classmethod
    def apply_to_svg(cls, svg_bytes: bytes, logo_base64: str) -> bytes:
        overlay = (
            '<rect x="37%" y="37%" width="26%" height="26%" rx="10" ry="10" fill="white" />'
            f'<image x="38%" y="38%" width="24%" height="24%" preserveAspectRatio="xMidYMid meet" href="{logo_base64}" />'
        )
        svg_text = svg_bytes.decode("utf-8")
        return svg_text.replace("</svg>", f"{overlay}</svg>").encode("utf-8")