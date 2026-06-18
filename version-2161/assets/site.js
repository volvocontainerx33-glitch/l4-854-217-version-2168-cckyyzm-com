const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupNavigation() {
    const toggle = $(".nav-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
        const open = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", String(open));
    });

    $$(".mobile-link").forEach((link) => {
        link.addEventListener("click", () => {
            document.body.classList.remove("nav-open");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
}

function setupHero() {
    const hero = $("[data-hero]");
    if (!hero) return;

    const slides = $$(".hero-slide", hero);
    const dots = $$(".hero-dot", hero);
    const nextButton = $("[data-hero-next]", hero);
    const prevButton = $("[data-hero-prev]", hero);
    let index = 0;
    let timer = null;

    const show = (next) => {
        index = (next + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
        dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
        if (timer) window.clearInterval(timer);
    };

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            show(i);
            start();
        });
    });

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            show(index + 1);
            start();
        });
    }

    if (prevButton) {
        prevButton.addEventListener("click", () => {
            show(index - 1);
            start();
        });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
}

function fillSelectOptions(select, values) {
    if (!select) return;
    const current = select.value;
    values
        .filter(Boolean)
        .sort((a, b) => String(b).localeCompare(String(a), "zh-CN"))
        .forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    select.value = current;
}

function setupFilters() {
    const grids = $$(".searchable-grid");
    if (!grids.length) return;

    const cards = grids.flatMap((grid) => $$("[data-card]", grid));
    const keyword = $("[data-filter-keyword]");
    const year = $("[data-filter-year]");
    const type = $("[data-filter-type]");
    const category = $("[data-filter-category]");
    const empty = $(".empty-state");

    fillSelectOptions(year, [...new Set(cards.map((card) => card.dataset.year))]);
    fillSelectOptions(type, [...new Set(cards.map((card) => card.dataset.type))]);

    const apply = () => {
        const q = (keyword?.value || "").trim().toLowerCase();
        const y = year?.value || "";
        const t = type?.value || "";
        const c = category?.value || "";
        let visible = 0;

        cards.forEach((card) => {
            const haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags,
                card.closest("main")?.textContent || ""
            ].join(" ").toLowerCase();
            const okKeyword = !q || haystack.includes(q);
            const okYear = !y || card.dataset.year === y;
            const okType = !t || card.dataset.type === t;
            const okCategory = !c || card.dataset.category === c;
            const ok = okKeyword && okYear && okType && okCategory;
            card.classList.toggle("is-hidden", !ok);
            if (ok) visible += 1;
        });

        if (empty) empty.hidden = visible !== 0;
    };

    [keyword, year, type, category].filter(Boolean).forEach((control) => {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
    });
}

function setupPlayers() {
    $$(".player-card").forEach((card) => {
        const video = $("video", card);
        const overlay = $(".player-overlay", card);
        const source = video?.querySelector("source")?.getAttribute("src");
        let hls = null;
        let ready = false;

        if (!video || !source) return;

        const attach = () => {
            if (ready) return;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            ready = true;
        };

        const play = async () => {
            attach();
            card.classList.add("is-playing");
            try {
                await video.play();
            } catch (error) {
                card.classList.remove("is-playing");
            }
        };

        overlay?.addEventListener("click", play);
        video.addEventListener("click", () => {
            if (video.paused) play();
        });
        video.addEventListener("play", () => card.classList.add("is-playing"));
        video.addEventListener("pause", () => card.classList.remove("is-playing"));
        window.addEventListener("beforeunload", () => {
            if (hls) hls.destroy();
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
});
