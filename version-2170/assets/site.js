(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var thumbs = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-thumb]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      if (!slides.length) {
        return;
      }
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        thumbs.forEach(function (thumb, thumbIndex) {
          thumb.classList.toggle('is-active', thumbIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          var index = Number(thumb.getAttribute('data-hero-thumb')) || 0;
          show(index);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }

      restart();
    });
  }

  function setupSearch() {
    document.querySelectorAll('[data-search-root]').forEach(function (root) {
      var input = root.querySelector('[data-card-search]');
      var filters = Array.prototype.slice.call(root.querySelectorAll('[data-filter-field]'));
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
      var count = root.querySelector('[data-result-count]');
      var empty = root.querySelector('[data-empty-state]');

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesFilters = filters.every(function (filter) {
            var value = filter.value;
            if (!value || value === 'all') {
              return true;
            }
            var field = filter.getAttribute('data-filter-field');
            return (card.getAttribute('data-' + field) || '') === value;
          });
          var shown = matchesQuery && matchesFilters;
          card.classList.toggle('is-hidden', !shown);
          if (shown) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = String(visible);
        }
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      filters.forEach(function (filter) {
        filter.addEventListener('change', apply);
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (section) {
      var shell = section.querySelector('.player-shell');
      var video = section.querySelector('video');
      var trigger = section.querySelector('[data-play-trigger]');
      if (!shell || !video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var attached = false;
      var hls = null;

      function attachStream() {
        if (attached || !stream) {
          return Promise.resolve();
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
          });
        }
        video.src = stream;
        return Promise.resolve();
      }

      function playVideo() {
        attachStream().then(function () {
          shell.classList.add('is-playing');
          return video.play();
        }).catch(function () {
          shell.classList.remove('is-playing');
        });
      }

      if (trigger) {
        trigger.addEventListener('click', playVideo);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          shell.classList.remove('is-playing');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
