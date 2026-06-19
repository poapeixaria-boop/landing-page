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
index.html          # a landing (institucional)
minima.css          # estilos da landing
minima.js           # reveals on-scroll (IntersectionObserver)
webgl.js            # shader do fundo (águas/caustics) — compartilhado landing + soft opening
favicon.svg
assets/             # imagens (mar, peixe, ofício, prato, brasa) + og-soft.png
design-system/      # styles.css + tokens (cores, fontes, tipografia, espaçamento)
robots.txt · sitemap.xml

# Modo SOFT OPENING (ver seção abaixo)
soft-opening.html   # tela única de soft opening
soft-opening.css    # estilos da tela (vulto grafite, scrim, CTA)
soft-opening.js     # entrada cinematográfica (stagger)
vercel.json         # rewrite que serve a soft opening em / (a chave liga/desliga)
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

Até a inauguração real, o site serve uma **tela única de soft opening** no lugar da landing — a landing fica de **standby** (intocada, só oculta). É um modo **reversível por 1 arquivo**.

**Como funciona:** o `vercel.json` reescreve a raiz para a tela de soft opening:
```json
{
  "rewrites": [
    { "source": "/", "destination": "/soft-opening.html" },
    { "source": "/index.html", "destination": "/soft-opening.html" }
  ]
}
```
- `/` e `/index.html` passam a servir `soft-opening.html` (a landing não some do repo, só deixa de ser servida).
- `/soft-opening.html` e todos os assets/css/js continuam acessíveis normalmente.
- A tela tem `<meta robots="noindex">`, então a home não é indexada enquanto durar o soft opening.
- ⚠️ Isto é específico da **Vercel** (`vercel.json`). O arquivo `_redirects` (Netlify) **não** funciona aqui.

**Ligar o soft opening:** ter o `vercel.json` acima na `main` (já é o estado atual).

**Desligar na inauguração (volta a landing):**
```bash
git rm vercel.json        # ou esvaziar o array "rewrites"
git commit -m "Inauguração: desliga soft opening, volta a landing"
git push                  # Vercel republica → / volta a servir index.html
```

**Conteúdo da tela:** `soft opening` · *estamos atendendo / somente por reserva.* · CTA de reserva via WhatsApp (**número real `5551997168316`**, mensagem `Olá. Gostaria de fazer uma reserva.`). Fundo: shader WebGL navy + vulto grafite (`soft-opening.css`).

## Pendências
- [ ] **Landing (`index.html`):** ainda usa o WhatsApp placeholder (`5551900000000`) no CTA e no rodapé. A tela de soft opening já usa o número real (`5551997168316`); alinhar a landing antes de desligar o soft opening.
