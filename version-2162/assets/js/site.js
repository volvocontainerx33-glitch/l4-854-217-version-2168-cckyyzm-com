(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.getElementById("mobilePanel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.textContent = open ? "×" : "☰";
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dotsRoot = root.querySelector("[data-hero-dots]");
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        var dots = [];

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
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

        if (dotsRoot) {
            slides.forEach(function (_, dotIndex) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.className = "hero-dot";
                dot.setAttribute("aria-label", "切换推荐影片");
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
                dotsRoot.appendChild(dot);
                dots.push(dot);
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFiltering() {
        var lists = Array.prototype.slice.call(document.querySelectorAll(".searchable-list"));
        if (!lists.length) {
            return;
        }
        var input = document.querySelector(".local-filter");
        var type = document.querySelector(".type-filter");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input && query) {
            input.value = query;
        }

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var selectedType = normalize(type ? type.value : "");
            lists.forEach(function (list) {
                var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .ranking-card"));
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-category"),
                        card.textContent
                    ].join(" "));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesType = !selectedType || cardType.indexOf(selectedType) !== -1;
                    card.classList.toggle("is-filtered-out", !(matchesKeyword && matchesType));
                });
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (type) {
            type.addEventListener("change", apply);
        }
        apply();
    }

    window.initMoviePlayer = function (videoId, src, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !src) {
            return;
        }
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else {
                video.src = src;
            }
            video.controls = true;
            return Promise.resolve();
        }

        function play() {
            load().then(function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            });
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFiltering();
    });
})();
