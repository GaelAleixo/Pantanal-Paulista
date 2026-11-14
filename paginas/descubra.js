
  /* ===== Planeje sua visita: abre a busca no Google Maps ===== */
  (function(){
    /* Links de busca no Google Maps definidos à mão para cada cidade (posição e zoom já ajustados). */
    var G='https://www.google.com/maps/search/';
    var LINKS={
      hospedagem:{
        'Mirandópolis':G+'hotel+pousada+em+Mirand%C3%B3polis,+SP/@-21.1359246,-51.1084643,14.42z',
        'Castilho':G+'hotel+pousada+em+Castilho,+SP/@-20.8649582,-51.4911555,13.66z',
        'Rubiácea':G+'Hot%C3%A9is/@-21.267282,-50.7206798,12.67z',
        'Andradina':G+'hotel+em+Andradina,+SP/@-20.900147,-51.3887789,13.73z',
        'Pereira Barreto':G+'Hot%C3%A9is/@-20.6362574,-51.1158905,14z',
        'Valparaíso':G+'Hot%C3%A9is/@-21.2288855,-50.8742132,14z/data=!3m1!4b1',
        'Sud Mennucci':G+'hotel+pousada+em+Sud+Mennucci,+SP/@-20.7217519,-50.9223967,16.6z',
        'Bento de Abreu':G+'Hot%C3%A9is/@-21.2598526,-50.8488817,13z',
        'Itapura':G+'hotel+pousada+em+Itapura,+SP/@-20.6426019,-51.5144391,15.4z',
        'Ilha Solteira':G+'hotel+pousada+em+Ilha+Solteira,+SP/@-20.4238445,-51.3425551,14z',
        'Suzanápolis':G+'pens%C3%A3o+em+suzan%C3%A1polis+sp/@-20.5490219,-51.0999871,12z'
      },
      restaurantes:{
        'Mirandópolis':G+'restaurante+em+Mirand%C3%B3polis,+SP/@-21.1359232,-51.1084643,14z/data=!3m1!4b1',
        'Castilho':G+'restaurante+em+Castilho,+SP/@-20.8659476,-51.4944827,14.31z',
        'Rubiácea':G+'Restaurantes/@-21.299619,-50.7344868,16z/data=!3m1!4b1',
        'Andradina':G+'restaurante+em+Andradina,+SP/@-20.8972905,-51.3824719,13.8z',
        'Pereira Barreto':G+'Restaurantes/@-20.6385065,-51.1261902,14z/data=!3m1!4b1',
        'Valparaíso':G+'Restaurantes/@-21.2243467,-50.8782553,14z/data=!3m1!4b1',
        'Sud Mennucci':G+'Restaurantes/@-20.6921576,-50.9273455,14.95z',
        'Bento de Abreu':G+'Restaurantes+em+bento+de+abreu,+sp/@-21.2718908,-50.8148159,16z/data=!3m1!4b1',
        'Itapura':G+'restaurante+em+Itapura,+SP/@-20.6476961,-51.5133087,14.87z',
        'Ilha Solteira':G+'restaurante+em+Ilha+Solteira,+SP/@-20.4238421,-51.3425552,14z/data=!3m1!4b1',
        'Suzanápolis':G+'restaurante+em+suzan%C3%A1polis+sp/@-20.5158058,-51.0436224,13.62z'
      }
    };    var BASE={hospedagem:'hotel pousada',restaurantes:'restaurante'};
    document.querySelectorAll('form[data-busca]').forEach(function(f){
      f.addEventListener('submit',function(ev){
        var tipo=f.getAttribute('data-busca'), cid=f.elements['municipio'].value; if(!cid) return;
        var url=LINKS[tipo][cid];
        if(!url){   /* busca padrão pelo nome da cidade */
          var local = cid==='todo' ? 'Pantanal Paulista, SP' : cid+', SP';
          url='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(BASE[tipo]+' em '+local);
        }
        var a=document.createElement('a');   /* clique de link evita bloqueio de pop-up */
        a.href=url; a.target='_blank'; a.rel='noopener'; document.body.appendChild(a); a.click(); a.remove();
        ev.preventDefault();
      });
    });
  })();

  /* ===== Municípios: amostra de 3 cartões; "Ver todos" expande os demais ===== */
  (function(){
    var lista=document.getElementById('municipios-lista'), btn=document.getElementById('municipios-toggle'); if(!lista||!btn) return;
    var AMOSTRA=3, cartoes=lista.querySelectorAll('.cartao-municipio'); if(cartoes.length<=AMOSTRA){ btn.hidden=true; return; }
    function definir(aberto){
      lista.classList.toggle('municipios-recolhidos',!aberto);
      btn.setAttribute('aria-expanded',aberto?'true':'false');
      btn.textContent=aberto?'Ver menos':'Ver todos ('+cartoes.length+')';
    }
    btn.addEventListener('click',function(ev){ ev.preventDefault(); definir(lista.classList.contains('municipios-recolhidos')); });
    /* links como "Ver detalhes" do mapa apontam para um cartão que pode estar recolhido */
    function revelar(){
      var id=''; try{ id=decodeURIComponent(location.hash.slice(1)); }catch(e){ return; }  /* #%E0 malformado não pode quebrar a página */
      var alvo=id&&document.getElementById(id);
      if(alvo&&lista.contains(alvo)&&lista.classList.contains('municipios-recolhidos')){ definir(true); alvo.scrollIntoView(); }
    }
    window.addEventListener('hashchange',revelar);
    /* "Saiba mais" do mapa: expande a lista antes de o navegador rolar até o cartão (funciona mesmo com o mesmo # repetido) */
    document.addEventListener('click',function(ev){
      if(ev.defaultPrevented) return;
      var a=ev.target.closest&&ev.target.closest('a[href^="#municipio-"]'); if(!a) return;
      var alvo=document.getElementById(a.getAttribute('href').slice(1));
      if(alvo&&lista.contains(alvo)&&lista.classList.contains('municipios-recolhidos')) definir(true);
    });
    definir(false); revelar();
  })();

  /* ===== Mapa real do Google Maps com as 9 cidades ===== */
  (function(){
    var cfg=window.PANTANAL_CONFIG||{}, el=document.getElementById('mapa-google'); if(!el) return;
    var CID=window.PANTANAL_CIDADES=[["Mirandópolis",-21.13361,-51.10167,"mirandopolis"],["Castilho",-20.8722,-51.4875,"castilho"],["Rubiácea",-21.30056,-50.72667,"rubiacea"],["Andradina",-20.8956,-51.3797,"andradina"],["Pereira Barreto",-20.6358,-51.1114,"pereira-barreto"],["Valparaíso",-21.22778,-50.86833,"valparaiso"],["Sud Mennucci",-20.69083,-50.92389,"sud-mennucci"],["Bento de Abreu",-21.27056,-50.81194,"bento-de-abreu"],["Itapura",-20.6417,-51.505,"itapura"],["Ilha Solteira",-20.42722,-51.34361,"ilha-solteira"],["Suzanápolis",-20.50139,-51.02472,"suzanapolis"]];
    var falhou=false;
    function fallback(){
      falhou=true;
      if(el.querySelector('.mapa-apoio')) return;
      el.innerHTML='<iframe class="mapa-apoio" title="Mapa do Pantanal Paulista" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" src="https://www.google.com/maps?q=Andradina%2C+SP&z=8&output=embed"></iframe>';
    }
    if(!cfg.GOOGLE_MAPS_API_KEY){ fallback(); return; }
    /* se o Google recusar a chave (domínio/porta não autorizados, API desativada, faturamento), mostra o mapa simples em vez da tela de erro */
    window.gm_authFailure=function(){ console.error('Google Maps recusou a chave. Veja a mensagem em vermelho do Google (ex.: RefererNotAllowedMapError) e ajuste no Google Cloud.'); fallback(); setTimeout(function(){ el.querySelector('.mapa-apoio')||fallback(); },600); };
    window.initMapaPantanal=async function(){
      try{
        var m=await google.maps.importLibrary('maps'), k=await google.maps.importLibrary('marker');
        if(falhou) return;
        /* o mapa usa um contêiner interno: se a chave falhar, o mapa de apoio substitui tudo sem o Google reescrever por cima */
        var cont=document.createElement('div'); cont.style.cssText='width:100%;height:100%'; el.appendChild(cont);
        var map=new m.Map(cont,{center:{lat:-20.95,lng:-51.15},zoom:9,mapId:cfg.GOOGLE_MAPS_MAP_ID||'DEMO_MAP_ID',mapTypeControl:false,streetViewControl:false});
        var info=new m.InfoWindow(), b=new google.maps.LatLngBounds(), marcas={}, atual=null, chips={};
        /* botões das cidades abaixo do mapa (são links para o cartão; com o mapa ativo, selecionam o pin) */
        document.querySelectorAll('.mapa-lista a[href^="#municipio-"]').forEach(function(a){ chips[a.getAttribute('href').slice(11)]=a; });
        function destacar(id,on){
          var o=marcas[id]; if(!o) return;
          try{ o.pin.background=on?'#B7791F':'#1B4332'; o.pin.borderColor=on?'#7A4F12':'#143024'; o.pin.scale=on?1.4:1; }catch(e){}
          o.mk.zIndex=on?1000:null;
          var ch=chips[id]; if(ch){ ch.classList.toggle('ativo',on); if(on) ch.setAttribute('aria-current','true'); else ch.removeAttribute('aria-current'); }
        }
        function limpar(){ if(atual){ destacar(atual,false); atual=null; } }
        function selecionar(id){
          var o=marcas[id]; if(!o) return;
          limpar(); atual=id; destacar(id,true);
          var d=document.createElement('div'), t=document.createElement('strong'), a=document.createElement('a');
          d.className='mapa-info'; t.textContent=o.nome;
          a.href='#municipio-'+id; a.className='btn btn-primario btn-pequeno'; a.textContent='Saiba mais';
          d.appendChild(t); d.appendChild(a);
          info.setContent(d); info.open({map:map,anchor:o.mk});
          map.panTo(o.pos); if((map.getZoom()||0)<10) map.setZoom(10);
        }
        info.addListener('closeclick',limpar);
        CID.forEach(function(c){
          var pin=new k.PinElement({background:'#1B4332',borderColor:'#143024',glyphColor:'#FFFFFF'}), pos={lat:c[1],lng:c[2]};
          var mk=new k.AdvancedMarkerElement({map:map,position:pos,title:c[0],content:pin.element});
          marcas[c[3]]={mk:mk,pin:pin,pos:pos,nome:c[0]};
          mk.addListener('gmp-click',function(){ selecionar(c[3]); });
          b.extend(pos);
        });
        Object.keys(chips).forEach(function(id){
          chips[id].addEventListener('click',function(ev){ if(!marcas[id]) return; ev.preventDefault(); selecionar(id); });
        });
        map.fitBounds(b,40);
      }catch(e){ fallback(); }
    };
    var s=document.createElement('script');
    s.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(cfg.GOOGLE_MAPS_API_KEY)+'&v=weekly&language=pt-BR&region=BR&loading=async&callback=initMapaPantanal';
    s.async=true; s.onerror=fallback; document.head.appendChild(s);
  })();
  
