/* ===== Eventos e Destaques: filtros + eventos aprovados (eventos.json) =====
   O eventos.json é gerado na publicação a partir da planilha; o endereço da
   planilha não existe no site. Todo texto é inserido com textContent (sem HTML). */
(function () {
  var cfg = window.PANTANAL_CONFIG || {};
  var lista = document.querySelector('.lista-eventos');
  if (!lista) return;
  var botoes = document.querySelectorAll('.btn-filtro'), filtro = 'Todos';
  var link = document.getElementById('link-form-evento');
  var caixa = document.querySelector('.eventos-acoes');
  if (link && caixa && /^https:\/\//.test(cfg.EVENTOS_FORM_URL || '')) { link.href = cfg.EVENTOS_FORM_URL; caixa.hidden = false; }

  function aplicar() {
    lista.querySelectorAll('.item-evento').forEach(function (li) {
      li.hidden = !(filtro === 'Todos' || li.getAttribute('data-categoria') === filtro);
    });
  }
  botoes.forEach(function (b) {
    b.addEventListener('click', function () {
      botoes.forEach(function (x) { x.classList.remove('btn-filtro-ativo'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('btn-filtro-ativo'); b.setAttribute('aria-pressed', 'true');
      filtro = b.textContent.trim(); aplicar();
    });
  });

  var MES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  function dia(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function badge(a, b) {
    if (b && b > a) {
      return a.getMonth() === b.getMonth()
        ? a.getDate() + '-' + b.getDate() + ' ' + MES[a.getMonth()]
        : a.getDate() + ' ' + MES[a.getMonth()] + ' - ' + b.getDate() + ' ' + MES[b.getMonth()];
    }
    return a.getDate() + ' ' + MES[a.getMonth()];
  }
  function seguro(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }

  fetch('eventos.json', { cache: 'no-store', credentials: 'omit' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (dados) {
    var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    var ev = (dados && Array.isArray(dados.eventos) ? dados.eventos : []).map(function (e) {
      return { ini: dia(e.inicio), fim: dia(e.fim), n: String(e.nome || ''), c: String(e.categoria || ''),
        l: String(e.local || ''), d: String(e.descricao || ''), k: seguro(String(e.link || '')) };
    }).filter(function (x) { return x.ini && x.n && (x.fim || x.ini) >= hoje; });

    ev.sort(function (a, b) { return a.ini - b.ini; }).reverse().forEach(function (x) {
      var li = document.createElement('li'); li.className = 'item-evento'; li.setAttribute('data-categoria', x.c);
      var s = document.createElement('span'); s.className = 'data-evento'; s.textContent = badge(x.ini, x.fim);
      var d = document.createElement('div'); d.className = 'info-evento';
      var h3 = document.createElement('h3'); h3.textContent = x.n; d.appendChild(h3);
      if (x.l) { var p = document.createElement('p'); p.textContent = x.l; d.appendChild(p); }
      if (x.d) { var p2 = document.createElement('p'); p2.className = 'evento-desc'; p2.textContent = x.d; d.appendChild(p2); }
      if (x.k) { var a = document.createElement('a'); a.href = x.k; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Mais informações'; d.appendChild(a); }
      li.appendChild(s); li.appendChild(d); lista.insertBefore(li, lista.firstChild);
    });
    aplicar();
  }).catch(function () { /* sem eventos.json (ex.: abrindo localmente): só a lista fixa é exibida */ });
})();
