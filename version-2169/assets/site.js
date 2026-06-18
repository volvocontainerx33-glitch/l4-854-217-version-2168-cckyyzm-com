(function () {
    var mobileToggle = document.querySelector(".mobile-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener("click", function () {
            var isOpen = mobileMenu.classList.toggle("is-open");
            mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var toolbar = document.querySelector(".catalog-toolbar");
    if (toolbar) {
        var searchInput = toolbar.querySelector("[data-filter='search']");
        var regionSelect = toolbar.querySelector("[data-filter='region']");
        var typeSelect = toolbar.querySelector("[data-filter='type']");
        var yearSelect = toolbar.querySelector("[data-filter='year']");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var emptyState = document.querySelector(".empty-state");

        function filterCards() {
            var query = (searchInput && searchInput.value ? searchInput.value : "").trim().toLowerCase();
            var region = regionSelect && regionSelect.value ? regionSelect.value : "all";
            var type = typeSelect && typeSelect.value ? typeSelect.value : "all";
            var year = yearSelect && yearSelect.value ? yearSelect.value : "all";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchRegion = region === "all" || card.getAttribute("data-region") === region;
                var matchType = type === "all" || card.getAttribute("data-type") === type;
                var matchYear = year === "all" || card.getAttribute("data-year") === year;
                var isVisible = matchQuery && matchRegion && matchType && matchYear;
                card.style.display = isVisible ? "" : "none";
                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", filterCards);
                control.addEventListener("change", filterCards);
            }
        });
    }

    function initializeVideo(video) {
        if (!video || video.getAttribute("data-ready") === "true") {
            return;
        }

        var source = video.getAttribute("data-hls");
        if (!source) {
            return;
        }

        video.setAttribute("data-ready", "true");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsPlayer = hls;
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            });
            return;
        }

        video.src = source;
    }

    function playVideo(video, cover) {
        initializeVideo(video);
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (cover) {
                    cover.classList.remove("is-hidden");
                }
            });
        }
    }

    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        if (!video) {
            return;
        }

        if (cover) {
            cover.addEventListener("click", function () {
                playVideo(video, cover);
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo(video, cover);
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (cover && video.currentTime === 0) {
                cover.classList.remove("is-hidden");
            }
        });
    });
})();
