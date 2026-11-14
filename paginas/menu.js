/* Menu sanduíche: abre/fecha o menu no celular */
(function () {
  var btn = document.querySelector('.menu-toggle');
  var nav = document.getElementById('menu-principal');
  if (!btn || !nav) return;

  function definir(aberto) {
    nav.classList.toggle('aberto', aberto);
    btn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    btn.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  }

  btn.addEventListener('click', function () {
    definir(!nav.classList.contains('aberto'));
  });

  /* fecha ao escolher um link, ao apertar Esc ou ao voltar para a tela grande */
  nav.addEventListener('click', function (ev) {
    if (ev.target.closest && ev.target.closest('a')) definir(false);
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && nav.classList.contains('aberto')) { definir(false); btn.focus(); }
  });
  var larga = window.matchMedia && window.matchMedia('(min-width: 769px)');
  if (larga && larga.addEventListener) larga.addEventListener('change', function (e) { if (e.matches) definir(false); });
})();
