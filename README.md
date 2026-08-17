# qrcode-generator

Base inicial do sistema descrito em [PLANO_DESENVOLVIMENTO.md](./PLANO_DESENVOLVIMENTO.md).

## O que ja foi iniciado

- Monorepo com pastas de backend, frontend e nginx.
- Backend Django com modelos base e endpoints `/api/generator/preview/` e `/api/generator/generate/`.
- Frontend React + Vite com landing page e tela de geracao conectada ao backend.
- Arquivos de Docker e `docker-compose` alinhados ao plano.

## Proximos passos recomendados

1. Criar e aplicar migrations do Django.
2. Integrar autenticacao com `django-allauth` e `dj-rest-auth`.
3. Implementar CRUD de templates e conectar o historico autenticado.