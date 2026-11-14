    (function () {
      const trilho  = document.getElementById('carrossel-trilho');
      const slides  = trilho.querySelectorAll('.slide');
      const dots    = document.querySelectorAll('.dot');
      const btnPrev = document.getElementById('btn-prev');
      const btnNext = document.getElementById('btn-next');
      let atual = 0;
      let timer;

      function ir(indice) {
        slides[atual].classList.remove('slide-ativo');
        dots[atual].classList.remove('ativo');
        dots[atual].setAttribute('aria-selected', 'false');

        atual = (indice + slides.length) % slides.length;

        slides[atual].classList.add('slide-ativo');
        dots[atual].classList.add('ativo');
        dots[atual].setAttribute('aria-selected', 'true');
      }

      function avancar()  { ir(atual + 1); }
      function recuar()   { ir(atual - 1); }

      function iniciarTimer() {
        clearInterval(timer);
        timer = setInterval(avancar, 5000);
      }

      // Inicializa o primeiro slide
      slides[0].classList.add('slide-ativo');

      btnNext.addEventListener('click', function () { avancar(); iniciarTimer(); });
      btnPrev.addEventListener('click', function () { recuar();  iniciarTimer(); });

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          ir(parseInt(dot.dataset.indice, 10));
          iniciarTimer();
        });
      });

      // Pausa ao passar o mouse
      trilho.addEventListener('mouseenter', function () { clearInterval(timer); });
      trilho.addEventListener('mouseleave', iniciarTimer);

      iniciarTimer();
    })();
  
