(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      mobileToggle.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-global-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var target = form.getAttribute('data-target') || 'videos.html';
      var query = input ? input.value.trim() : '';
      window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
    });
  });

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  document.querySelectorAll('[data-search-panel]').forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-button]'));
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var countNode = panel.querySelector('[data-result-count]');
    var emptyState = scope.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    function applyFilters() {
      var query = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var inCategory = activeFilter === 'all' || card.getAttribute('data-category') === activeFilter;
        var haystack = normalize(card.getAttribute('data-search'));
        var matchesText = !query || haystack.indexOf(query) !== -1;
        var shouldShow = inCategory && matchesText;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter-value') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');
      if (initialQuery) {
        input.value = initialQuery;
      }
      input.addEventListener('input', applyFilters);
    }

    applyFilters();
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    if (slides.length < 2) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });
})();
