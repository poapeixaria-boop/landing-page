/* =====================================================================
   PEIXARIA — v3 MINIMALISTA · motion
   Leve de propósito: sem libs. Só reveals por IntersectionObserver.
   (O fundo vivo da v3a é CSS; a v3b troca por um shader WebGL.)
   ===================================================================== */
(function () {
  var root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // sem anim → conteúdo visível
  root.classList.add('anim');

  function reveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  }

  if (document.readyState !== 'loading') reveal();
  else document.addEventListener('DOMContentLoaded', reveal);
})();
