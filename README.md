# PEIXARIA — landing page

Site institucional da **PEIXARIA** — casa de frutos do mar em Porto Alegre, só por reserva.
Página única, estática, com fundo WebGL (águas/caustics) em tema escuro minimalista.

🔗 Produção: **https://www.peixariapoa.com.br**

## Stack
- HTML + CSS + JavaScript **estático**, sem build step e sem dependências.
- Fundo animado: shader WebGL puro (`webgl.js`), com fallback em CSS e respeito a `prefers-reduced-motion`.
- Tipografia via Google Fonts; design tokens em `design-system/`.

## Estrutura
```
index.html          # a página
minima.css          # estilos da landing
minima.js           # reveals on-scroll (IntersectionObserver)
webgl.js            # shader do fundo (águas/caustics)
favicon.svg
assets/             # imagens (mar, peixe, ofício, prato, brasa)
design-system/      # styles.css + tokens (cores, fontes, tipografia, espaçamento)
robots.txt · sitemap.xml
```

## Rodar localmente
Por ser estático, basta um servidor de arquivos:
```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Deploy
Hospedado na **Vercel**, conectado a este repositório (branch `main`).
**Todo push para `main` publica automaticamente** — não há comando de build (projeto estático, output na raiz).

Fluxo de atualização:
```bash
git add -A
git commit -m "descrição da mudança"
git push
```

## Pendências
- [ ] Substituir o número de WhatsApp placeholder (`5551900000000`) pelo número real — aparece no CTA "Solicitar reserva" e no rodapé (`index.html`).
