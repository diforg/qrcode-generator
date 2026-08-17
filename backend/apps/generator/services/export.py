import base64
import io
from uuid import uuid4


class ExportService:
    @staticmethod
    def to_png_buffer(image, resolution: int):
        resized = image.resize((resolution, resolution))
        buffer = io.BytesIO()
        resized.save(buffer, format="PNG")
        buffer.seek(0)
        return buffer, "image/png", f"qrcode_{uuid4().hex}.png"

    @staticmethod
    def to_svg_buffer(svg_bytes: bytes):
        buffer = io.BytesIO(svg_bytes)
        buffer.seek(0)
        return buffer, "image/svg+xml", f"qrcode_{uuid4().hex}.svg"

    @staticmethod
    def to_base64_png(image, resolution: int) -> str:
        resized = image.resize((resolution, resolution))
        buffer = io.BytesIO()
        resized.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"