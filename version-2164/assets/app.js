(function () {
  function qs(root, selector) {
    return root.querySelector(selector);
  }

  function qsa(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  var navToggle = qs(document, '[data-nav-toggle]');
  var mobileNav = qs(document, '[data-mobile-nav]');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  qsa(document, '[data-hero]').forEach(function (hero) {
    var slides = qsa(hero, '.hero-slide');
    var dots = qsa(hero, '.hero-dot');
    var next = qs(hero, '[data-hero-next]');
    var prev = qs(hero, '[data-hero-prev]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  qsa(document, '[data-filter-root]').forEach(function (root) {
    var search = qs(root, '[data-local-search]');
    var year = qs(root, '[data-filter-year]');
    var genre = qs(root, '[data-filter-genre]');
    var cards = qsa(root, '.movie-card');
    var empty = qs(root, '[data-empty-state]');

    function apply() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var genreValue = genre ? genre.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
        var ok = true;
        if (query && text.indexOf(query) === -1) {
          ok = false;
        }
        if (yearValue && card.dataset.year !== yearValue) {
          ok = false;
        }
        if (genreValue && (card.dataset.genre || '').indexOf(genreValue) === -1 && (card.dataset.tags || '').indexOf(genreValue) === -1) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [search, year, genre].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
  });

  var searchInputs = qsa(document, '[data-site-search]');
  searchInputs.forEach(function (input) {
    var box = input.closest('.search-box');
    var panel = box ? qs(box, '[data-search-results]') : null;
    if (!panel) {
      return;
    }

    function close() {
      panel.classList.remove('open');
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      if (!query || !window.SITE_MOVIES) {
        panel.innerHTML = '';
        close();
        return;
      }
      var results = window.SITE_MOVIES.filter(function (item) {
        return [item.t, item.r, item.g, item.y].join(' ').toLowerCase().indexOf(query) !== -1;
      }).slice(0, 8);
      if (!results.length) {
        panel.innerHTML = '<div class="search-result-item"><span><strong>暂无匹配影片</strong><span>换个关键词继续浏览</span></span></div>';
        panel.classList.add('open');
        return;
      }
      panel.innerHTML = results.map(function (item) {
        return '<a class="search-result-item" href="./' + item.u + '"><img src="' + item.c + '" alt="' + escapeHtml(item.t) + '"><span><strong>' + escapeHtml(item.t) + '</strong><span>' + escapeHtml(item.r) + ' · ' + escapeHtml(String(item.y)) + ' · ' + escapeHtml(item.g) + '</span></span></a>';
      }).join('');
      panel.classList.add('open');
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    document.addEventListener('click', function (event) {
      if (!box.contains(event.target)) {
        close();
      }
    });
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  qsa(document, '[data-player]').forEach(function (player) {
    var video = qs(player, 'video');
    var button = qs(player, '.play-overlay');
    var source = player.getAttribute('data-hls') || '';
    var ready = false;
    var hls = null;

    function attach() {
      if (!video || ready || !source) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attach();
      player.classList.add('is-playing');
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
