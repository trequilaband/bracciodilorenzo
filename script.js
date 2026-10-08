(function () {
  'use strict';

  var BRACCIO = { name: 'Braccio di Lorenzo', img: 'assets/img/braccio-lorenzo.jpg' };

  var AVVERSARI = [
    { name: 'Mike Bongiorno', img: 'assets/img/mike-bongiorno.jpg' },
    { name: 'Ridge di Beautiful', img: 'assets/img/ridge-di-beautiful.jpg' },
    { name: 'Camion della spazzatura Peterbilt', img: 'assets/img/camion-spazzatura.jpg' },
    { name: 'Panzer VI Tiger', img: 'assets/img/carro-armato.jpg' },
    { name: 'UH-60 Black Hawk', img: 'assets/img/elicottero.jpg' }
  ];

  var MSG_OK = 'Bravissimo/a, è molto più forte il braccio di Lorenzo!';
  var MSG_KO = 'No brutto stupido/a, è molto più forte il braccio di Lorenzo!';

  var $ = function (id) { return document.getElementById(id); };
  var screens = { start: $('screen-start'), game: $('screen-game'), end: $('screen-end') };

  var order = [];
  var round = 0;
  var score = 0;
  var answered = false;

  function show(name) {
    Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== name; });
    window.scrollTo(0, 0);
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function bold(text) {
    var b = document.createElement('b');
    b.textContent = '"' + text + '"';
    return b;
  }

  function makeCard(item, isBraccio) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card';
    btn.dataset.correct = isBraccio ? '1' : '0';
    btn.setAttribute('aria-label', item.name);

    var img = document.createElement('img');
    img.className = 'card-photo';
    img.src = item.img;
    img.alt = item.name;
    img.draggable = false;

    var name = document.createElement('span');
    name.className = 'card-name';
    name.textContent = item.name;

    btn.appendChild(img);
    btn.appendChild(name);
    btn.addEventListener('click', function () { answer(btn); });
    return btn;
  }

  function startGame() {
    order = shuffle(AVVERSARI);
    round = 0;
    score = 0;
    show('game');
    renderRound();
  }

  function renderRound() {
    answered = false;
    var opp = order[round];

    $('progress').textContent = 'Domanda ' + (round + 1) + ' di ' + order.length;

    var q = $('question');
    q.textContent = '';
    q.appendChild(document.createTextNode('È più forte il '));
    q.appendChild(bold(BRACCIO.name));
    q.appendChild(document.createTextNode(' o '));
    q.appendChild(bold(opp.name));
    q.appendChild(document.createTextNode('?'));

    var cards = [makeCard(BRACCIO, true), makeCard(opp, false)];
    if (Math.random() < 0.5) cards.reverse();

    var box = $('cards');
    box.textContent = '';
    cards.forEach(function (c) { box.appendChild(c); });

    var fb = $('feedback');
    fb.textContent = '';
    fb.className = 'feedback';

    $('btn-next').hidden = true;
  }

  function answer(btn) {
    if (answered) return;
    answered = true;

    var right = btn.dataset.correct === '1';
    if (right) score++;

    document.querySelectorAll('#cards .card').forEach(function (c) {
      c.disabled = true;
      if (c.dataset.correct === '1') {
        c.classList.add('is-right');
      } else if (c === btn) {
        c.classList.add('is-wrong');
      } else {
        c.classList.add('is-dim');
      }
    });

    var fb = $('feedback');
    fb.textContent = right ? MSG_OK : MSG_KO;
    fb.className = 'feedback ' + (right ? 'is-good' : 'is-bad');

    var next = $('btn-next');
    next.textContent = round === order.length - 1 ? 'Vedi il risultato' : 'Avanti';
    next.hidden = false;
    next.focus({ preventScroll: true });
  }

  function next() {
    if (round < order.length - 1) {
      round++;
      renderRound();
    } else {
      showEnd();
    }
  }

  function endText() {
    if (score === order.length) return 'Punteggio perfetto. Il braccio di Lorenzo è fiero di te.';
    if (score === 0) return 'Zero su ' + order.length + '. Il braccio di Lorenzo ti perdona, ma solo perché è buono.';
    return 'Il braccio di Lorenzo è più forte di tutto. Chi non lo sapeva ora lo sa.';
  }

  function showEnd() {
    $('score').textContent = 'Punteggio: ' + score + '/' + order.length;
    $('end-text').textContent = endText();
    show('end');
  }

  /* Immagine scaricabile: braccio di Lorenzo con il punteggio sopra */

  var armImg = new Image();
  armImg.src = BRACCIO.img;

  function drawTrophy(ctx, x, y, size) {
    var s = size / 100;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#123f4a';
    ctx.fillStyle = '#e4a430';
    var handles = new Path2D('M30 18H17C17 35 23 43 32 45M70 18H83C83 35 77 43 68 45');
    ctx.stroke(handles);
    var cup = new Path2D('M30 10H70V38C70 54 61 62 50 62C39 62 30 54 30 38Z');
    ctx.fill(cup); ctx.stroke(cup);
    var base = new Path2D('M46 62H54V76H46ZM37 76H63V84H37ZM31 84H69V92H31Z');
    ctx.fill(base); ctx.stroke(base);
    ctx.fillStyle = 'rgba(255,247,224,0.9)';
    ctx.fill(new Path2D('M50 20L53 28H62L55 33L58 41L50 36L42 41L45 33L38 28H47Z'));
    ctx.restore();
  }

  function centered(ctx, text, y, maxW) {
    ctx.fillText(text, ctx.canvas.width / 2, y, maxW);
  }

  function buildImage() {
    var W = 520, H = 1052;               // stesso rapporto della foto (130x263) per 4
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // foto a tutta tela (cover)
    var iw = armImg.naturalWidth || 130, ih = armImg.naturalHeight || 263;
    var k = Math.max(W / iw, H / ih);
    var dw = iw * k, dh = ih * k;
    ctx.fillStyle = '#123f4a';
    ctx.fillRect(0, 0, W, H);
    if (armImg.complete && armImg.naturalWidth) {
      ctx.drawImage(armImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }

    // fasce scure per leggere il testo
    var top = ctx.createLinearGradient(0, 0, 0, 330);
    top.addColorStop(0, 'rgba(18,63,74,0.92)');
    top.addColorStop(1, 'rgba(18,63,74,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, W, 330);

    var bottom = ctx.createLinearGradient(0, H - 300, 0, H);
    bottom.addColorStop(0, 'rgba(18,63,74,0)');
    bottom.addColorStop(1, 'rgba(18,63,74,0.95)');
    ctx.fillStyle = bottom;
    ctx.fillRect(0, H - 300, W, 300);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 8;

    drawTrophy(ctx, W / 2 - 55, 18, 110);

    ctx.fillStyle = '#ede6d8';
    ctx.font = '600 28px "Archivo", Arial, sans-serif';
    centered(ctx, 'PUNTEGGIO', 168, W - 40);

    ctx.fillStyle = '#e4a430';
    ctx.font = '600 110px "Fraunces", Georgia, serif';
    centered(ctx, score + '/' + order.length, 268, W - 40);

    ctx.fillStyle = '#ede6d8';
    ctx.font = '600 52px "Fraunces", Georgia, serif';
    centered(ctx, 'Congratulazioni!', H - 120, W - 40);

    ctx.font = '500 26px "Archivo", Arial, sans-serif';
    centered(ctx, 'Il braccio di Lorenzo è più forte', H - 70, W - 40);

    ctx.font = '600 20px "Archivo", Arial, sans-serif';
    ctx.fillStyle = '#e4a430';
    centered(ctx, 'TREQUILA BAND', H - 30, W - 40);

    return c;
  }

  function download() {
    var go = function () {
      var canvas = buildImage();
      var file = 'braccio-di-lorenzo-' + score + '-su-' + order.length + '.png';
      canvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = file;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      }, 'image/png');
    };
    // aspetta i font web, poi disegna
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(go);
    } else {
      go();
    }
  }

  $('btn-start').addEventListener('click', startGame);
  $('btn-next').addEventListener('click', next);
  $('btn-again').addEventListener('click', startGame);
  $('btn-download').addEventListener('click', download);
})();
