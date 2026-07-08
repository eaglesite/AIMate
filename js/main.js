$(function () {

    $('body').addClass('js-ready');
    setTimeout(function () { revealCards(); }, 50);

    function debounce(fn, delay) {
        var timer = null;
        return function () {
            var ctx = this, args = arguments;
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
        };
    }

    /* ===== Header scroll ===== */
    var $header = $('.site-header');
    $(window).on('scroll', debounce(function () {
        $header.toggleClass('scrolled', $(this).scrollTop() > 50);
    }, 10));

    /* ===== Mobile menu ===== */
    $('#menuToggle').on('click', function () {
        $(this).toggleClass('active');
        $('#mainNav').toggleClass('open');
    });
    $('#mainNav a').on('click', function () {
        $('#menuToggle').removeClass('active');
        $('#mainNav').removeClass('open');
    });
    $('a[href^="#"]').not('[href="#"]').on('click', function () {
        var href = $(this).attr('href');
        if (href && href !== '#ai-tools') { stopLazy(); }
    });
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $('#mainNav').hasClass('open')) {
            $('#menuToggle').removeClass('active');
            $('#mainNav').removeClass('open');
        }
    });

    /* ===== Lazy load tool cards ===== */
    var BATCH = 24;
    var lazyLoaded = 0;
    var $allCards = $('.tool-card');
    var $sentinel;
    var lazyObserver = null;
    var lazyStopped = false;

    function loadLazyBatch() {
        if (lazyStopped) return;
        var end = Math.min(lazyLoaded + BATCH, $allCards.length);
        for (var i = lazyLoaded; i < end; i++) {
            $allCards.eq(i).css('display', '');
        }
        lazyLoaded = end;
        revealCards();
    }

    function stopLazy() {
        if (lazyStopped) return;
        lazyStopped = true;
        if (lazyObserver) { lazyObserver.disconnect(); lazyObserver = null; }
        if ($sentinel) { $sentinel.remove(); $sentinel = null; }
    }

    function revealAllLazy() {
        stopLazy();
        if (lazyLoaded >= $allCards.length) return;
        $allCards.slice(lazyLoaded).css('display', '');
        lazyLoaded = $allCards.length;
        revealCards();
    }

    $allCards.css('display', 'none');
    var cols = Math.max(1, Math.floor(($('#toolGrid').width() + 20) / 320));
    var initialBatch = Math.min(cols * 3, $allCards.length);
    for (var i = 0; i < initialBatch; i++) { $allCards.eq(i).css('display', ''); }
    lazyLoaded = initialBatch;
    revealCards();

    $sentinel = $('<div class="lazy-sentinel" style="grid-column:1/-1;height:1px"></div>');
    $('#toolGrid').append($sentinel);

    if ('IntersectionObserver' in window) {
        lazyObserver = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting && lazyLoaded < $allCards.length && !lazyStopped) {
                loadLazyBatch();
            }
            if (lazyLoaded >= $allCards.length && lazyObserver) {
                stopLazy();
            }
        }, { rootMargin: '250px 0px' });
        lazyObserver.observe($sentinel[0]);
    }

    function doSearch() {
        var q = $('#toolSearch').val().toLowerCase().trim();
        var isEN = $('html').attr('lang') === 'en';

        /* ---- Filter tools ---- */
        revealAllLazy();
        var toolFilter = ($('#ai-tools .filter-btn.active').data('filter') || 'all');
        var toolVisible = false;
        $('.tool-card').each(function () {
            var $card = $(this);
            var catMatch = (toolFilter === 'all') || ($card.data('category') === toolFilter);
            var txt = ($card.data('name') || '') + ' ' + ($card.data('category') || '') + ' ' + $card.text();
            var searchMatch = (q === '') || txt.toLowerCase().indexOf(q) !== -1;
            var match = catMatch && searchMatch;
            $card.toggleClass('filtered', !match).css('display', match ? '' : 'none');
            if (match) { toolVisible = true; setTimeout(function () { $card.addClass('revealed'); }, 20); }
        });
        $('#noResults').toggleClass('show', !toolVisible);
        var tc = $('.tool-card:visible').length;
        $('#toolResultCount').text(toolVisible ? (isEN ? tc + ' tools found' : '共 ' + tc + ' 个工具') : '');

        /* ---- Filter templates ---- */
        var tmplFilter = ($('#templates .filter-btn.active').data('tmpl-filter') || 'all');
        var tmplVisible = false;
        $('.template-card').each(function () {
            var $card = $(this);
            var catMatch = (tmplFilter === 'all') || ($card.data('tmpl') === tmplFilter);
            var txt = $card.text();
            var searchMatch = (q === '') || txt.toLowerCase().indexOf(q) !== -1;
            var match = catMatch && searchMatch;
            $card.toggleClass('filtered', !match).css('display', match ? '' : 'none');
            if (match) { tmplVisible = true; setTimeout(function () { $card.addClass('revealed'); }, 20); }
        });
        $('#tmplNoResults').toggleClass('show', !tmplVisible);
        var tmc = $('.template-card:visible').length;
        $('#tmplResultCount').text(tmplVisible ? (isEN ? tmc + ' templates found' : '共 ' + tmc + ' 个模板') : '');
    }

    /* ===== Unified search ===== */
    $('#toolSearch').on('input', debounce(doSearch, 200));
    $('#toolSearchClear').on('click', function () {
        $('#toolSearch').val('').focus();
        doSearch();
    });

    /* ===== Tool filter buttons ===== */
    $('#ai-tools .filter-btn').on('click', function () {
        $('#ai-tools .filter-btn').removeClass('active');
        $(this).addClass('active');
        doSearch();
    });

    /* ===== Template filter buttons ===== */
    $('#templates .filter-btn').on('click', function () {
        $('#templates .filter-btn').removeClass('active');
        $(this).addClass('active');
        doSearch();
    });

    /* ===== Back to top ===== */
    var $backTop = $('#backToTop');
    $(window).on('scroll', debounce(function () {
        $backTop.toggleClass('visible', $(window).scrollTop() > 400);
    }, 50));
    $backTop.on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 400);
        $(this).blur();
    });

    /* ===== Stats counter ===== */
    function animateCounter($el) {
        var target = parseInt($el.data('count'), 10);
        if (target === 0) { $el.text('0'); return; }
        var current = 0;
        var steps = 40;
        var increment = target / steps;
        var timer = setInterval(function () {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
            $el.text(Math.floor(current));
        }, 30);
    }
    var counted = false;
    function checkStats() {
        if (counted) return;
        var $stats = $('.hero-stats');
        if ($stats.length && $(window).scrollTop() + $(window).height() > $stats.offset().top + 100) {
            $('.stat-num').each(function () { animateCounter($(this)); });
            counted = true;
        }
    }
    $(window).on('scroll', debounce(checkStats, 50));
    checkStats();

    /* ===== Scroll reveal ===== */
    function revealCards() {
        var windowBottom = $(window).scrollTop() + $(window).height();
        $('.tool-card, .template-card').each(function () {
            var $card = $(this);
            if ($card.hasClass('filtered') || $card.css('display') === 'none') return;
            if ($card.offset().top < windowBottom - 80) {
                $card.addClass('revealed');
            }
        });
    }
    $(window).on('scroll', debounce(revealCards, 30));
    revealCards();

    /* ===== Newsletter form ===== */
    $('#newsletterForm').on('submit', function (e) {
        e.preventDefault();
        var $input = $(this).find('input[type="email"]');
        var email = $input.val().trim();
        if (!email) return;
        var isEN = $('html').attr('lang') === 'en';
        var $btn = $(this).find('.btn');
        var origText = $btn.text();
        $btn.prop('disabled', true).text(isEN ? 'Submitting...' : '提交中...');
        $.ajax({
            url: 'https://openapi.eagleclouds.com/api/email',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email: email, source: 'newsletter' }),
            success: function () {
                alert(isEN ? 'Thanks for subscribing!' : '感谢订阅！');
                $input.val('');
            },
            error: function (xhr) {
                var msg = isEN ? 'Subscription failed' : '订阅失败';
                if (xhr.status === 409) {
                    msg = isEN ? 'Email already subscribed' : '该邮箱已订阅';
                } else if (xhr.responseJSON && xhr.responseJSON.message) {
                    msg = xhr.responseJSON.message;
                }
                alert(msg);
            },
            complete: function () {
                $btn.prop('disabled', false).text(origText);
            }
        });
    });

});
