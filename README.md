# PEIXARIA — landing page

Site institucional da **PEIXARIA** — casa de frutos do mar em Porto Alegre, só por reserva.
Página única, estática, com fundo WebGL (águas/caustics) em tema escuro minimalista.

🔗 Produção: **https://www.peixariapoa.com.br**

## Stack
- HTML + CSS + JavaScript **estático**, sem build step e sem dependências.
- Fundo animado: shader WebGL puro (`webgl.js`), com fallback em CSS e respeito a `prefers-reduced-motion`.
- Tipografia via Google Fonts; design tokens em `design-system/`.

## Estrutura
> ⚠️ **Agora em modo SOFT OPENING** (ver seção abaixo): a homepage (`index.html`) é a tela
> de soft opening; a landing institucional está parada como `landing.html`.
```
index.html          # HOMEPAGE — hoje = a tela de soft opening (em standby normal seria a landing)
landing.html        # a landing institucional completa (parada até a inauguração)
soft-opening.css    # estilos da tela de soft opening (vulto grafite, scrim, CTA)
soft-opening.js     # entrada cinematográfica (stagger)
minima.css          # estilos da landing
minima.js           # reveals on-scroll (IntersectionObserver)
webgl.js            # shader do fundo (águas/caustics) — compartilhado landing + soft opening
favicon.svg
assets/             # imagens (mar, peixe, ofício, prato, brasa) + og-soft.png
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

## Modo SOFT OPENING

Até a inauguração, a **homepage é uma tela de soft opening** no lugar da landing. A landing fica **parada (standby)** como `landing.html` — nada é perdido, só renomeado. Reversível renomeando de volta.

**Por que renomear (e não um rewrite):** a Vercel serve arquivos estáticos **antes** de aplicar `rewrites` — um `index.html` existente "ganha" de qualquer rewrite para `/`, então a soft opening nunca apareceria. (No Netlify o `200!` força; na Vercel não há equivalente.) A forma confiável e independente de host é o próprio `index.html` da homepage **ser** a tela desejada.

**Estado atual (soft opening ligado):**
- `index.html` = a tela de soft opening (vulto grafite + shader WebGL; `<meta robots="noindex">`, então a home não é indexada).
- `landing.html` = a landing institucional completa, com todo o SEO, parada em standby.

**Reverter na inauguração (volta a landing):**
```bash
git mv index.html soft-opening.html   # guarda a tela de soft opening
git mv landing.html index.html        # a landing volta a ser a homepage
git commit -m "Inauguração: volta a landing"
git push                              # Vercel republica → / serve a landing
```

**Conteúdo da tela:** `soft opening` · *estamos atendendo / somente por reserva.* · CTA de reserva via WhatsApp (**número real `5551997168316`**, mensagem `Olá. Gostaria de fazer uma reserva.`). Arquivos da tela: `index.html` (ex-`soft-opening.html`) + `soft-opening.css` + `soft-opening.js` + `assets/og-soft.png`.

## Pendências
- [ ] **Landing (`landing.html`):** ainda usa o WhatsApp placeholder (`5551900000000`) no CTA e no rodapé. A tela de soft opening já usa o número real (`5551997168316`); alinhar a landing antes de reverter na inauguração.
- [ ] *(opcional)* Enquanto durar o soft opening, `sitemap.xml`/`robots.txt` ainda referenciam a home como a landing — a tela tem `noindex`, então sem dano; revisar se o soft opening durar muito.
