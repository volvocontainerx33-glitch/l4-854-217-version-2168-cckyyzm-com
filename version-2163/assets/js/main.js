(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var previous = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img[data-fallback-title]"));

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        var shell = image.closest(".poster-shell, .hero-poster, .mini-card");

        if (shell) {
          shell.classList.add("poster-missing");
        }

        image.style.visibility = "hidden";
      });
    });
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q") || "";

    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var reset = scope.querySelector("[data-filter-reset]");
      var result = scope.querySelector("[data-filter-result]");
      var grid = document.querySelector("[data-filter-grid]");
      var empty = document.querySelector("[data-empty-state]");

      if (!grid) {
        return;
      }

      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search-card]"));

      if (input && queryFromUrl) {
        input.value = queryFromUrl;
      }

      function cardText(card) {
        return [
          card.dataset.title || "",
          card.dataset.region || "",
          card.dataset.type || "",
          card.dataset.year || "",
          card.dataset.keywords || ""
        ].join(" ").toLowerCase();
      }

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var selectedRegion = region ? region.value : "";
        var selectedType = type ? type.value : "";
        var selectedYear = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var matchesQuery = !q || cardText(card).indexOf(q) !== -1;
          var matchesRegion = !selectedRegion || card.dataset.region === selectedRegion;
          var matchesType = !selectedType || card.dataset.type === selectedType;
          var matchesYear = !selectedYear || card.dataset.year === selectedYear;
          var shouldShow = matchesQuery && matchesRegion && matchesType && matchesYear;

          card.hidden = !shouldShow;

          if (shouldShow) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = "共找到 " + visible + " 部影片";
        }

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (region) {
            region.value = "";
          }
          if (type) {
            type.value = "";
          }
          if (year) {
            year.value = "";
          }
          apply();
        });
      }

      apply();
    });
  }

  ready(function () {
    setupNavigation();
    setupHeroCarousel();
    setupImageFallbacks();
    setupFilters();
  });
})();
