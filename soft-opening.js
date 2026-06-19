/* =====================================================================
   PEIXARIA — TELA DE SOFT OPENING · motion
   Leve, sem libs. Só a entrada cinematográfica (stagger dos textos).
   O vulto (CSS) e o shader (webgl.js) não precisam de JS.
   ===================================================================== */
(function () {
  var root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('anim', 'ready');     // visível, sem transição (CSS zera)
    return;
  }
  root.classList.add('anim');
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add('ready'); });
  });
})();
