# QRCODE-GENERATOR — Documentação Técnica de Desenvolvimento

Micro SaaS para geração de QR Codes personalizados (cores, logotipo central, exportação em PNG/SVG de alta resolução), com dashboard de templates salvos e histórico de geração.

**Stack:**
- Front-end: React 18 + TypeScript + TailwindCSS
- Back-end: Python 3.12 + Django 5 + Django REST Framework (DRF)
- Banco de Dados: PostgreSQL 16
- Infra: Docker + Docker Compose + Gunicorn + NGINX + Linux
- Cache/Fila (opcional para geração assíncrona em lote): Redis + Celery

---

## 1. Estrutura do Projeto

### 1.1 Estrutura geral (monorepo)

```
qrcode-generator/
├── backend/
│   ├── config/                      # settings do projeto Django
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/                   # autenticação e perfil
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   ├── adapters.py          # django-allauth custom adapter
│   │   │   └── migrations/
│   │   ├── templates_qr/            # templates salvos de QR code
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── migrations/
│   │   ├── generator/               # core: geração do QR Code
│   │   │   ├── services/
│   │   │   │   ├── qr_builder.py
│   │   │   │   ├── logo_overlay.py
│   │   │   │   └── export.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── models.py            # histórico de geração
│   │   └── core/                    # utilitários compartilhados
│   │       ├── permissions.py
│   │       ├── pagination.py
│   │       └── exceptions.py
│   ├── static/
│   ├── media/                       # apenas em dev (produção não persiste arquivo gerado)
│   ├── requirements/
│   │   ├── base.txt
│   │   ├── development.txt
│   │   └── production.txt
│   ├── manage.py
│   ├── Dockerfile
│   └── entrypoint.sh
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── qr/
│   │   │   │   ├── QrCanvasPreview.tsx
│   │   │   │   ├── QrColorPicker.tsx
│   │   │   │   ├── QrLogoUploader.tsx
│   │   │   │   └── QrExportButtons.tsx
│   │   │   ├── ui/                  # botões, inputs, modais genéricos
│   │   │   └── auth/
│   │   │       ├── LoginForm.tsx
│   │   │       └── SocialLoginButtons.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── GeneratorPage.tsx
│   │   │   └── HistoryPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useQrGenerator.ts
│   │   ├── services/
│   │   │   ├── api.ts               # instância axios/fetch com interceptors
│   │   │   ├── authService.ts
│   │   │   ├── templateService.ts
│   │   │   └── generatorService.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── routes/
│   │   │   └── AppRoutes.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── nginx/
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## 2. Configuração Docker

### 2.1 `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/ requirements/
ARG ENV=production
RUN pip install -r requirements/${ENV}.txt

COPY . .
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN adduser --disabled-password --gecos "" appuser
USER appuser

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
```

### 2.2 `backend/entrypoint.sh`

```bash
#!/bin/sh
set -e

echo "Aguardando banco de dados..."
until python manage.py check --database default > /dev/null 2>&1; do
  sleep 1
done

echo "Aplicando migrations..."
python manage.py migrate --noinput

echo "Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

exec "$@"
```

### 2.3 `frontend/Dockerfile`

```dockerfile
# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa de produção (servido pelo NGINX)
FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2.4 `nginx/nginx.conf` (proxy reverso principal, produção)

```nginx
upstream backend_api {
    server backend:8000;
}

server {
    listen 80;
    server_name _;
    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
    }

    location /static/ {
        alias /app/static/;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 2.5 `docker-compose.yml` (desenvolvimento)

```yaml
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    container_name: qr_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: qr_redis
    restart: unless-stopped
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      args:
        ENV: development
    container_name: qr_backend
    restart: unless-stopped
    env_file: .env
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: >
      sh -c "python manage.py migrate &&
             python manage.py runserver 0.0.0.0:8000"

  celery_worker:
    build:
      context: ./backend
      args:
        ENV: development
    container_name: qr_celery
    restart: unless-stopped
    env_file: .env
    volumes:
      - ./backend:/app
    depends_on:
      - backend
      - redis
    command: celery -A config worker -l info

  frontend:
    build:
      context: ./frontend
    container_name: qr_frontend
    restart: unless-stopped
    env_file: .env
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev -- --host 0.0.0.0

  nginx:
    build:
      context: ./nginx
    container_name: qr_nginx
    restart: unless-stopped
    depends_on:
      - backend
      - frontend
    ports:
      - "80:80"
    volumes:
      - static_volume:/app/static

volumes:
  pg_data:
  static_volume:
```

> Em produção (`docker-compose.prod.yml`), substituir o comando do `backend` por `gunicorn`, remover bind mounts de código-fonte, usar `frontend` já buildado servido pelo próprio NGINX (sem `npm run dev`), e adicionar variáveis `DEBUG=False`, `ALLOWED_HOSTS` e certificados TLS.

---

## 3. Modelagem de Dados

### 3.1 DER (texto)

```
┌────────────────────────┐        ┌───────────────────────────────┐
│         User           │        │         QrTemplate            │
├────────────────────────┤        ├───────────────────────────────┤
│ id (PK)                │1      *│ id (PK)                       │
│ email (unique)         │───────▶│ user_id (FK -> User.id)       │
│ name                   │        │ name                          │
│ password_hash          │        │ fg_color (hex)                │
│ auth_provider (email/  │        │ bg_color (hex)                │
│   google/github)       │        │ logo_image (S3/blob ref)      │
│ avatar_url             │        │ dot_style (square/rounded/...)│
│ is_active              │        │ error_correction (L/M/Q/H)    │
│ created_at             │        │ created_at                    │
│ updated_at             │        │ updated_at                    │
└────────────────────────┘        └───────────────────────────────┘
          │1                                     │1
          │                                      │
          │*                                     │*
┌────────────────────────────────────────────────────────┐
│                     QrGenerationHistory                │
├────────────────────────────────────────────────────────┤
│ id (PK)                                                │
│ user_id (FK -> User.id, nullable p/ uso anônimo)       │
│ template_id (FK -> QrTemplate.id, nullable)            │
│ target_url                                             │
│ fg_color                                               │
│ bg_color                                               │
│ has_logo (bool)                                        │
│ export_format (PNG/SVG)                                │
│ resolution (px)                                        │
│ created_at                                             │
└────────────────────────────────────────────────────────┘
```

Relacionamentos:
- Um `User` possui muitos `QrTemplate` (1:N).
- Um `User` possui muitos `QrGenerationHistory` (1:N).
- Um `QrTemplate` pode estar associado a vários registros de `QrGenerationHistory` (1:N, opcional — reuso de template).

### 3.2 Migrations (Django)

**`apps/users/migrations/0001_initial.py`** (gerada via `makemigrations`, resumo do model):

```python
# apps/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    AUTH_PROVIDER_CHOICES = [
        ("email", "Email"),
        ("google", "Google"),
        ("github", "GitHub"),
    ]
    email = models.EmailField(unique=True)
    avatar_url = models.URLField(blank=True, null=True)
    auth_provider = models.CharField(
        max_length=20, choices=AUTH_PROVIDER_CHOICES, default="email"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
```

**`apps/templates_qr/models.py`**:

```python
from django.db import models
from django.conf import settings

class QrTemplate(models.Model):
    DOT_STYLE_CHOICES = [
        ("square", "Square"),
        ("rounded", "Rounded"),
        ("dots", "Dots"),
    ]
    ERROR_CORRECTION_CHOICES = [
        ("L", "Low"),
        ("M", "Medium"),
        ("Q", "Quartile"),
        ("H", "High"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="templates"
    )
    name = models.CharField(max_length=100)
    fg_color = models.CharField(max_length=7, default="#000000")
    bg_color = models.CharField(max_length=7, default="#FFFFFF")
    logo_image = models.ImageField(upload_to="logos/", blank=True, null=True)
    dot_style = models.CharField(max_length=20, choices=DOT_STYLE_CHOICES, default="square")
    error_correction = models.CharField(
        max_length=1, choices=ERROR_CORRECTION_CHOICES, default="H"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
```

**`apps/generator/models.py`**:

```python
from django.db import models
from django.conf import settings
from apps.templates_qr.models import QrTemplate

class QrGenerationHistory(models.Model):
    FORMAT_CHOICES = [("PNG", "PNG"), ("SVG", "SVG")]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="generation_history",
        null=True,
        blank=True,
    )
    template = models.ForeignKey(
        QrTemplate, on_delete=models.SET_NULL, null=True, blank=True
    )
    target_url = models.URLField()
    fg_color = models.CharField(max_length=7)
    bg_color = models.CharField(max_length=7)
    has_logo = models.BooleanField(default=False)
    export_format = models.CharField(max_length=3, choices=FORMAT_CHOICES, default="PNG")
    resolution = models.PositiveIntegerField(default=1024)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
```

Nota: o arquivo do QR Code gerado **não é persistido em disco** — apenas os metadados da geração são salvos em `QrGenerationHistory`. O logotipo de um `QrTemplate`, esse sim, é persistido (S3/volume) pois é reutilizável.

---

## 4. API (Backend) — Endpoints RESTful

### 4.1 Autenticação (`django-allauth` + `dj-rest-auth`)

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/register/` | Cadastro via e-mail/senha |
| POST | `/api/auth/login/` | Login e-mail/senha (retorna JWT) |
| POST | `/api/auth/logout/` | Logout (invalida refresh token) |
| POST | `/api/auth/token/refresh/` | Renova access token |
| GET  | `/api/auth/user/` | Retorna dados do usuário autenticado |
| GET  | `/api/auth/google/login/` | Inicia OAuth Google |
| GET  | `/api/auth/github/login/` | Inicia OAuth GitHub |
| GET/POST | `/api/auth/password/reset/` | Fluxo de reset de senha |

### 4.2 Templates (`/api/templates/`)

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/templates/` | Lista templates do usuário logado (paginado) |
| POST | `/api/templates/` | Cria novo template (cores, logo, estilo) |
| GET | `/api/templates/{id}/` | Detalhe de um template |
| PUT/PATCH | `/api/templates/{id}/` | Atualiza template |
| DELETE | `/api/templates/{id}/` | Remove template |

### 4.3 Geração de QR Code (`/api/generator/`) — Core

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/generator/preview/` | Gera preview em base64 (sem salvar histórico) para o canvas do front |
| POST | `/api/generator/generate/` | Gera arquivo final e retorna via `FileResponse` (download PNG/SVG) + grava histórico |
| GET | `/api/generator/history/` | Lista histórico de gerações do usuário (paginado) |
| DELETE | `/api/generator/history/{id}/` | Remove item do histórico |

**Payload de exemplo — `POST /api/generator/generate/`:**

```json
{
  "target_url": "https://meusite.com",
  "fg_color": "#1E1E1E",
  "bg_color": "#FFFFFF",
  "dot_style": "rounded",
  "error_correction": "H",
  "logo_base64": "data:image/png;base64,...",   
  "export_format": "PNG",
  "resolution": 1024,
  "template_id": null,
  "save_as_template": false,
  "template_name": null
}
```

### 4.4 Lógica do Controller (view) — `generator/views.py`

```python
class GenerateQrView(APIView):
    permission_classes = [AllowAny]  # geração anônima permitida; histórico só se autenticado

    def post(self, request):
        serializer = GenerateQrRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 1. Construir o QR Code base (matriz de módulos) via qr_builder.py
        qr_image = QrBuilderService.build(
            data=data["target_url"],
            fg_color=data["fg_color"],
            bg_color=data["bg_color"],
            error_correction=data["error_correction"],
            dot_style=data["dot_style"],
        )

        # 2. Se houver logo, aplicar overlay central via logo_overlay.py
        if data.get("logo_base64"):
            qr_image = LogoOverlayService.apply(
                qr_image=qr_image,
                logo_base64=data["logo_base64"],
            )

        # 3. Exportar para o formato solicitado, em memória (sem tocar disco)
        buffer, content_type, filename = ExportService.to_buffer(
            image=qr_image,
            export_format=data["export_format"],
            resolution=data["resolution"],
        )

        # 4. Se usuário autenticado, gravar histórico (metadados apenas)
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

        # 5. Retornar arquivo via FileResponse, sem salvar em disco
        return FileResponse(buffer, as_attachment=True, filename=filename, content_type=content_type)
```

---

## 5. Front-end (Páginas e Componentes)

| Página | Rota | Descrição |
|---|---|---|
| `LandingPage.tsx` | `/` | Hero com exemplos de QR Codes estilizados, seção de features, CTA "Criar seu QR Code" |
| `LoginPage.tsx` | `/login` | Formulário e-mail/senha + botões de login social (Google/GitHub) |
| `RegisterPage.tsx` | `/register` | Cadastro de nova conta |
| `DashboardPage.tsx` | `/dashboard` | Lista de templates salvos (CRUD), botão "Novo QR Code" |
| `GeneratorPage.tsx` | `/generator` | Tela principal: formulário de customização + `QrCanvasPreview` em tempo real + botões de export |
| `HistoryPage.tsx` | `/history` | Histórico de gerações do usuário, com filtros por data/formato |

**Componentes-chave:**

- `QrCanvasPreview.tsx`: recebe as props de cor/estilo/logo e chama `POST /api/generator/preview/` (debounced, ~400ms) para renderizar o preview em `<canvas>` a partir do base64 retornado.
- `QrColorPicker.tsx`: seletor de cor de fundo e de módulo (usa `react-colorful` ou similar).
- `QrLogoUploader.tsx`: drag-and-drop de imagem, converte para base64 no client antes de enviar.
- `QrExportButtons.tsx`: dispara `POST /api/generator/generate/` e trata o `blob` da resposta para download (PNG ou SVG).

**Fluxo de estado (`useQrGenerator.ts`):**
1. Mantém estado local do formulário (URL, cores, estilo, logo, resolução).
2. Debounce dispara preview automático a cada alteração.
3. Ao clicar em "Baixar", chama o serviço de geração final e aciona `URL.createObjectURL(blob)` + `<a download>` simulado.

---

## 6. Algoritmo Diferencial — Geração do QR Code com Overlay de Logo

### 6.1 Passo a passo

1. **Validação da URL de destino**: normalizar (`https://` obrigatório), rejeitar payloads maiores que o limite seguro para o nível de correção de erro escolhido.
2. **Construção da matriz QR** (`qr_builder.py`, usando a biblioteca `qrcode`):
   - Instanciar `qrcode.QRCode(error_correction=ERROR_LEVELS[level], box_size=10, border=4)`.
   - `qr.add_data(url)` e `qr.make(fit=True)`.
   - Gerar imagem base com `qr.make_image(fill_color=fg_color, back_color=bg_color)`, convertendo para modo `RGBA` via Pillow.
   - Se `dot_style` for `rounded` ou `dots`, usar um `StyledPilImage` com `module_drawer` customizado (`RoundedModuleDrawer`, `CircleModuleDrawer` da própria lib `qrcode.image.styles`).
3. **Overlay do logotipo** (`logo_overlay.py`):
   - Decodificar o `logo_base64` recebido em um objeto `PIL.Image`.
   - Redimensionar o logo para no máximo **22–25% da largura total do QR Code** (limite que preserva a capacidade de leitura mesmo com correção de erro `H`, que tolera até ~30% de dados corrompidos).
   - Adicionar um **respiro branco** (padding) ao redor do logo, desenhando um retângulo/círculo branco levemente maior atrás dele, para não confundir o scanner com os módulos vizinhos.
   - Calcular a posição central: `x = (qr_width - logo_width) // 2`, `y = (qr_height - logo_height) // 2`.
   - Colar o logo sobre o QR usando `qr_image.paste(logo, (x, y), mask=logo)` (o `mask` usa o canal alfa do logo para permitir transparência).
   - **Importante**: sempre gerar o QR com `error_correction="H"` quando houver logo, para garantir a leitura mesmo com a área central ocupada.
4. **Exportação em memória** (`export.py`):
   - Para PNG: `image.save(buffer, format="PNG")`, ajustando resolução via `image.resize((resolution, resolution), Image.LANCZOS)`.
   - Para SVG: usar `qrcode.image.svg.SvgImage` como `image_factory` na construção do QR (gerado nativamente vetorial); overlay de logo em SVG é feito embutindo o PNG do logo como elemento `<image>` em base64 dentro do XML do SVG.
   - Escrever tudo em um `io.BytesIO()`, dar `buffer.seek(0)` e retornar — **nunca gravar em `MEDIA_ROOT`**.
5. **Resposta HTTP**: `FileResponse(buffer, as_attachment=True, filename=f"qrcode_{uuid4().hex}.{ext}", content_type=mime_type)`.

### 6.2 Pseudocódigo resumido

```
function generate_qr(url, fg_color, bg_color, dot_style, error_correction, logo?, format, resolution):
    qr_matrix = build_qr_matrix(url, error_correction, box_size=10, border=4)
    image = render_matrix(qr_matrix, fg_color, bg_color, dot_style)

    if logo exists:
        error_correction = "H"  # forçar máxima tolerância
        logo_img = decode_base64(logo)
        logo_img = resize(logo_img, max_percent=0.25 * image.width)
        logo_img = add_white_padding(logo_img)
        position = center(image, logo_img)
        image = paste(image, logo_img, position, use_alpha_mask=true)

    buffer = in_memory_stream()
    if format == "PNG":
        image = resize(image, resolution)
        image.save(buffer, "PNG")
    else if format == "SVG":
        buffer = render_svg(qr_matrix, fg_color, bg_color, embedded_logo=logo_img)

    return buffer  # nunca tocar disco
```

---

## 7. Variáveis de Ambiente (`.env.example`)

```env
# ---------- Django ----------
DEBUG=True
SECRET_KEY=troque-esta-chave-em-producao
DJANGO_SETTINGS_MODULE=config.settings.development
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# ---------- Banco de Dados ----------
POSTGRES_DB=qrcode_generator
POSTGRES_USER=qrcode_user
POSTGRES_PASSWORD=troque-esta-senha
POSTGRES_HOST=db
POSTGRES_PORT=5432
DATABASE_URL=postgres://qrcode_user:troque-esta-senha@db:5432/qrcode_generator

# ---------- Redis / Celery ----------
REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/1

# ---------- Auth Social (django-allauth) ----------
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=

# ---------- JWT ----------
JWT_ACCESS_TOKEN_LIFETIME_MIN=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# ---------- Storage de logos de template (opcional S3) ----------
USE_S3=False
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=us-east-1

# ---------- Front-end ----------
VITE_API_BASE_URL=http://localhost/api
VITE_GOOGLE_CLIENT_ID=

# ---------- CORS ----------
CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:5173
```

---

## 8. Comandos Iniciais

```bash
# 1. Clonar o repositório e entrar na pasta
git clone <repo-url> qrcode-generator && cd qrcode-generator

# 2. Copiar variáveis de ambiente
cp .env.example .env

# 3. Subir todos os containers (build inicial)
docker-compose up --build -d

# 4. Rodar as migrations (caso não sejam aplicadas automaticamente pelo entrypoint)
docker-compose exec backend python manage.py migrate

# 5. Criar superusuário para acessar o /admin
docker-compose exec backend python manage.py createsuperuser

# 6. (Opcional) Popular banco com dados de exemplo
docker-compose exec backend python manage.py loaddata fixtures/seed_templates.json
# ou, via management command customizado:
docker-compose exec backend python manage.py seed_demo_data

# 7. Instalar dependências do front-end (se rodando fora do container em dev)
cd frontend && npm install && npm run dev

# 8. Acessar a aplicação
# Front-end:  http://localhost:5173  (dev) ou http://localhost (via nginx)
# API:        http://localhost:8000/api/  (dev) ou http://localhost/api/ (via nginx)
# Admin:      http://localhost:8000/admin/

# 9. Rodar testes do backend
docker-compose exec backend python manage.py test

# 10. Derrubar os containers
docker-compose down -v
```

---

## 9. Requisitos Python principais (`backend/requirements/base.txt`)

```txt
Django==5.0.*
djangorestframework==3.15.*
django-allauth==0.63.*
dj-rest-auth==6.0.*
djangorestframework-simplejwt==5.3.*
django-cors-headers==4.4.*
psycopg2-binary==2.9.*
qrcode==7.4.*
Pillow==10.4.*
celery==5.4.*
redis==5.0.*
gunicorn==22.0.*
python-decouple==3.8
whitenoise==6.7.*
```

---

## 10. Checklist de Entrega

- [ ] Estrutura de pastas criada (backend/frontend/nginx)
- [ ] Dockerfiles funcionais (backend, frontend, nginx)
- [ ] `docker-compose.yml` sobe todos os serviços sem erro
- [ ] Migrations criadas e aplicadas (`User`, `QrTemplate`, `QrGenerationHistory`)
- [ ] Autenticação (e-mail/senha + Google + GitHub) funcionando
- [ ] Endpoint `/api/generator/preview/` retornando base64 para o canvas
- [ ] Endpoint `/api/generator/generate/` retornando arquivo via `FileResponse` (sem persistir em disco)
- [ ] Overlay de logo testado com diferentes tamanhos e níveis de correção de erro
- [ ] Exportação PNG e SVG validada
- [ ] Dashboard com CRUD de templates funcional
- [ ] Histórico de gerações exibido e paginado
- [ ] Landing page publicada com exemplos visuais
- [ ] Variáveis de ambiente documentadas e `.env` configurado