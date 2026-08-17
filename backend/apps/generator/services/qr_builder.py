import io

import qrcode
from qrcode.constants import ERROR_CORRECT_H, ERROR_CORRECT_L, ERROR_CORRECT_M, ERROR_CORRECT_Q
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers.pil import CircleModuleDrawer, RoundedModuleDrawer, SquareModuleDrawer
from qrcode.image.svg import SvgImage


ERROR_LEVELS = {
    "L": ERROR_CORRECT_L,
    "M": ERROR_CORRECT_M,
    "Q": ERROR_CORRECT_Q,
    "H": ERROR_CORRECT_H,
}

DRAWERS = {
    "square": SquareModuleDrawer(),
    "rounded": RoundedModuleDrawer(),
    "dots": CircleModuleDrawer(),
}


class QrBuilderService:
    @classmethod
    def build_png(cls, data: str, fg_color: str, bg_color: str, error_correction: str, dot_style: str):
        qr = qrcode.QRCode(error_correction=ERROR_LEVELS[error_correction], box_size=20, border=3)
        qr.add_data(data)
        qr.make(fit=True)

        image = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=DRAWERS[dot_style],
            fill_color=fg_color,
            back_color=bg_color,
        )
        return image.convert("RGBA")

    @classmethod
    def build_svg(cls, data: str, fg_color: str, bg_color: str, error_correction: str) -> bytes:
        qr = qrcode.QRCode(error_correction=ERROR_LEVELS[error_correction], box_size=10, border=3, image_factory=SvgImage)
        qr.add_data(data)
        qr.make(fit=True)

        image = qr.make_image(fill_color=fg_color, back_color=bg_color)
        buffer = io.BytesIO()
        image.save(buffer)
        return buffer.getvalue()