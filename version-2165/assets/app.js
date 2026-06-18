(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;
  var heroTimer = null;

  function showHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroTimer) {
      clearInterval(heroTimer);
    }

    if (slides.length > 1) {
      heroTimer = setInterval(function () {
        showHeroSlide(heroIndex + 1);
      }, 5600);
    }
  }

  var nextButton = document.querySelector('[data-hero-next]');
  var prevButton = document.querySelector('[data-hero-prev]');

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showHeroSlide(heroIndex + 1);
      startHeroTimer();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showHeroSlide(heroIndex - 1);
      startHeroTimer();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHeroSlide(index);
      startHeroTimer();
    });
  });

  startHeroTimer();

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-key]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-list] .movie-card'));

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-filter-key');
      var value = button.getAttribute('data-filter-value');

      filterButtons.forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');

      cards.forEach(function (card) {
        var visible = key === 'all' || card.getAttribute('data-' + key) === value;
        card.classList.toggle('is-filtered-out', !visible);
      });
    });
  });

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-site-search-form]'));
  var searchLayer = document.querySelector('[data-search-layer]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchKeyword = document.querySelector('[data-search-keyword]');
  var searchClose = document.querySelector('[data-search-close]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderSearch(query) {
    if (!searchLayer || !searchResults || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }

    var keyword = normalize(query);
    var results = window.SITE_MOVIES.filter(function (movie) {
      var haystack = normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + movie.tags);
      return haystack.indexOf(keyword) !== -1;
    }).slice(0, 36);

    searchKeyword.textContent = keyword ? '搜索：' + query : '请输入影片名称、地区、年份或类型';

    if (!keyword) {
      searchResults.innerHTML = '';
    } else if (!results.length) {
      searchResults.innerHTML = '<p class="search-empty">暂未找到匹配影片</p>';
    } else {
      searchResults.innerHTML = results.map(function (movie) {
        return '<a class="search-item" href="./' + movie.file + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
          '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</span></span>' +
          '</a>';
      }).join('');
    }

    searchLayer.classList.add('is-open');
    searchLayer.setAttribute('aria-hidden', 'false');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[type="search"]');
      renderSearch(input ? input.value : '');
    });
  });

  if (searchClose && searchLayer) {
    searchClose.addEventListener('click', function () {
      searchLayer.classList.remove('is-open');
      searchLayer.setAttribute('aria-hidden', 'true');
    });
  }

  if (searchLayer) {
    searchLayer.addEventListener('click', function (event) {
      if (event.target === searchLayer) {
        searchLayer.classList.remove('is-open');
        searchLayer.setAttribute('aria-hidden', 'true');
      }
    });
  }
})();

function initMoviePlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var prepared = false;
  var hls = null;

  if (!video || !button || !source) {
    return;
  }

  function hideButton() {
    button.classList.add('is-hidden');
  }

  function playVideo() {
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  function prepareVideo() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          prepared = false;
          button.classList.remove('is-hidden');
        }
      });
      return;
    }

    video.src = source;
    video.load();
  }

  function start() {
    hideButton();
    prepareVideo();
    playVideo();
  }

  button.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', hideButton);
  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
