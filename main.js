$(function () {

    var $body   = $('body');
    var $header = $('header');

    /* ─────────────────────────────────────
       DARK MODE
    ───────────────────────────────────── */
    var $toggle = $('.theme-toggle');
    var isDark  = localStorage.getItem('darkMode') === 'true';

    function applyTheme(dark) {
        $body.toggleClass('dark-mode', dark);
        $toggle.text(dark ? '☀️' : '🌙');
        $toggle.attr('title', dark ? 'Passa alla modalità chiara' : 'Passa alla modalità scura');
        localStorage.setItem('darkMode', String(dark));
    }

    applyTheme(isDark);

    $toggle.on('click', function () {
        isDark = !isDark;
        applyTheme(isDark);
    });

    /* ─────────────────────────────────────
       HEADER sticky / hero-mode
    ───────────────────────────────────── */
    var hasHero = $('.home-hero, .hero-project, .page-hero').length > 0;
    if (hasHero) $header.addClass('hero-mode');

    function updateHeader() {
        var scrolled = $(window).scrollTop() > 80;
        $header.toggleClass('sticky', scrolled);
        $body.toggleClass('sticky-header', scrolled);
        if (hasHero) $header.toggleClass('hero-mode', !scrolled);
    }
    $(window).on('scroll.header', updateHeader);
    updateHeader();

    /* ─────────────────────────────────────
       HAMBURGER
    ───────────────────────────────────── */
    var $ham = $('.hamburger');
    var $nav = $('.nav-links').not('.nav-links-sub');

    $ham.on('click', function () {
        $nav.toggleClass('open');
        $ham.toggleClass('open');
    });

    $nav.find('a').on('click', function () {
        $nav.removeClass('open');
        $ham.removeClass('open');
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('header').length) {
            $nav.removeClass('open');
            $ham.removeClass('open');
        }
    });

    /* ─────────────────────────────────────
       SMOOTH SCROLL (ancore)
    ───────────────────────────────────── */
    $('a[href^="#"]').on('click', function (e) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').animate({ scrollTop: target.offset().top - 70 }, 250);
        }
    });

    /* ─────────────────────────────────────
       BACK TO TOP
    ───────────────────────────────────── */
    var $btt = $('.back-to-top');
    $(window).on('scroll.btt', function () {
        $btt.toggleClass('visible', $(window).scrollTop() > 300);
    });
    $btt.on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 350);
    });

    /* ─────────────────────────────────────
       SCROLL REVEAL
       Elementi con classe .sr appaiono
       quando entrano nel viewport
    ───────────────────────────────────── */
    function checkReveal() {
        var winH   = $(window).height();
        var scrollY = $(window).scrollTop();
        $('.sr:not(.sr-done)').each(function () {
            var top = $(this).offset().top;
            if (top < scrollY + winH * 0.9) {
                $(this).addClass('sr-done');
            }
        });
    }
    $(window).on('scroll.sr resize.sr', checkReveal);
    // Prima run dopo un tick (così il DOM è pronto)
    setTimeout(checkReveal, 100);

    /* ─────────────────────────────────────
       BACK BUTTON (SM.) — scroll memory
       Funziona così:
       1. Ogni volta che clicchi un link verso
          una pagina progetto, salvo:
          - la pagina in cui ti trovi
          - la posizione Y attuale
       2. Quando clicchi SM. nella pagina
          progetto, segno che al prossimo
          caricamento devo ripristinare.
       3. Al caricamento, se trovo il flag,
          scrollo alla posizione salvata.
    ───────────────────────────────────── */
    var MEM_KEY = 'smBackScroll';
    var PROJECT_PAGES = [
        'ust.html','montasmonta.html','busconnect.html',
        'progetto4.html','progetto5.html','progetto6.html'
    ];

    // Intercetta clic su link verso pagine progetto
    $(document).on('click', 'a', function () {
        var href = ($(this).attr('href') || '').split('?')[0].split('#')[0];
        var isProjectLink = PROJECT_PAGES.indexOf(href) !== -1;
        var isBackLink    = $(this).hasClass('back-link');

        if (isProjectLink && !isBackLink) {
            // Sto entrando in una pagina progetto: salvo da dove vengo
            sessionStorage.setItem(MEM_KEY, JSON.stringify({
                page : window.location.pathname.split('/').pop() || 'index.html',
                y    : $(window).scrollTop(),
                ready: false
            }));
        }

        if (isBackLink) {
            // Sto tornando indietro: segno che al caricamento devo ripristinare
            var raw = sessionStorage.getItem(MEM_KEY);
            if (raw) {
                var mem = JSON.parse(raw);
                mem.ready = true;
                sessionStorage.setItem(MEM_KEY, JSON.stringify(mem));
                // Naviga verso la pagina salvata (ignora href del link)
                window.location.href = mem.page;
                return false;
            }
        }
    });

    // Al caricamento: se c'è un ripristino in attesa, eseguilo
    (function () {
        var raw = sessionStorage.getItem(MEM_KEY);
        if (!raw) return;
        var mem = JSON.parse(raw);
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (mem.ready && mem.page === currentPage) {
            sessionStorage.removeItem(MEM_KEY);
            $(window).scrollTop(0); // reset prima
            setTimeout(function () {
                $(window).scrollTop(parseInt(mem.y, 10) || 0);
            }, 80);
        }
    })();

    /* ─────────────────────────────────────
       YEAR TABS (projects.html)
    ───────────────────────────────────── */
    $('.year-tab').on('click', function () {
        var idx = $(this).index();
        $('.year-tab').removeClass('active');
        $(this).addClass('active');
        $('.projects-grid').removeClass('active');
        $('.projects-grid').eq(idx).addClass('active');
    });

    /* ─────────────────────────────────────
       SKILLS TABS (skills.html)
    ───────────────────────────────────── */
    $('.skills-tab').on('click', function () {
        var idx = $(this).index();
        $('.skills-tab').removeClass('active');
        $(this).addClass('active');
        $('.skills-tab-content').removeClass('active');
        $('.skills-tab-content').eq(idx).addClass('active');
    });

    /* ─────────────────────────────────────
       GALLERY SLIDER (montasmonta.html)
    ───────────────────────────────────── */
    var $gallery = $('#gallery');
    if ($gallery.length) {
        var $imgs  = $gallery.children('img');
        var total  = $imgs.length;
        var cur    = 0;
        var $indic = $('#galleryIndicators');

        $imgs.each(function (i) {
            var $dot = $('<div class="gallery-indicator"></div>');
            if (i === 0) $dot.addClass('active');
            $dot.on('click', function () { goTo(i); });
            $indic.append($dot);
        });

        function goTo(idx) {
            cur = idx;
            $gallery.css('transform', 'translateX(' + (-cur * 100) + '%)');
            $('.gallery-indicator').removeClass('active').eq(cur).addClass('active');
        }

        setInterval(function () { goTo((cur + 1) % total); }, 3000);
    }

});
