(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNavigation() {
    var button = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var next = root.querySelector(".hero-control.next");
    var prev = root.querySelector(".hero-control.prev");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var fields = Array.prototype.slice.call(document.querySelectorAll(".site-search, .filter-input"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    if (!fields.length || !cards.length) {
      return;
    }
    var emptyStates = Array.prototype.slice.call(document.querySelectorAll(".empty-state"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function matches(card, query, filters) {
      var haystack = normalize(card.getAttribute("data-search"));
      if (query && haystack.indexOf(query) === -1) {
        return false;
      }
      return Object.keys(filters).every(function (name) {
        var expected = filters[name];
        if (!expected) {
          return true;
        }
        return normalize(card.getAttribute("data-" + name)).indexOf(expected) !== -1;
      });
    }

    function apply() {
      var search = document.querySelector(".site-search");
      var query = normalize(search ? search.value : "");
      var filters = {};
      document.querySelectorAll(".filter-input").forEach(function (field) {
        filters[field.getAttribute("data-filter")] = normalize(field.value);
      });
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card, query, filters);
        card.classList.toggle("is-filtered-out", !ok);
        if (ok) {
          visible += 1;
        }
      });
      emptyStates.forEach(function (node) {
        node.classList.toggle("is-visible", visible === 0);
      });
    }

    fields.forEach(function (field) {
      field.addEventListener("input", apply);
      field.addEventListener("change", apply);
    });
  }

  window.setupPlayer = function (src, videoId) {
    var video = document.getElementById(videoId);
    if (!video || !src) {
      return;
    }
    var frame = video.closest(".player-frame");
    var overlay = frame ? frame.querySelector(".player-overlay") : null;
    var hlsInstance = null;
    var loaded = false;

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            var retry = video.play();
            if (retry && typeof retry.catch === "function") {
              retry.catch(function () {});
            }
          });
        }
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
