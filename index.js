document.addEventListener('DOMContentLoaded', () => {

    // Helper function untuk querySelectorAll dan iterasi
    const $ = selector => document.querySelector(selector);
    const $$ = selector => document.querySelectorAll(selector);

    // =============================================================================
    // MAIN MENU
    // =============================================================================
    const navObj = {
        '.js-work-main-nav': '.work',
        '.js-porto-main-nav': '.portofolio',
        '.js-client-main-nav': '.client',
        '.js-contact-main-nav': '.contact'
    };

    Object.entries(navObj).forEach(([key, val]) => {
        $(key)?.addEventListener('click', (ev) => {
            ev.preventDefault();
            $(val)?.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // =============================================================================
    // STATS
    // =============================================================================
    const activeTimers = new Map();

    /**
     * Mengformat angka dengan presisi tertentu dan mengganti desimal
     * @param {number} num Angka yang akan diformat
     * @param {number} precision Jumlah digit desimal
     * @returns {string} Angka yang diformat
     */
    const formatNumber = (num, precision) => num.toFixed(precision).replace('.', ',');

    /**
     * Animasi penghitung angka.
     */
    function animateCounter(elementId, finalNumber, durationMs, targetUnit, divisor = 1, precision = 0) {
        // Hapus timer lama
        const existingTimer = activeTimers.get(elementId);
        if (existingTimer) {
            clearInterval(existingTimer);
            activeTimers.delete(elementId);
        }

        const displayElement = $(elementId);
        const unitElement = $(elementId.replace('digit', 'unit')); // Unit ID dihasilkan dari Number ID

        if (!displayElement || !unitElement) return;

        let currentNumber = 0;
        const stepTime = 10;
        const totalSteps = durationMs / stepTime;
        const increment = finalNumber / totalSteps;

        // Reset tampilan awal
        displayElement.textContent = formatNumber(0, precision);
        unitElement.textContent = '';

        const timer = setInterval(() => {
            currentNumber += increment;

            if (currentNumber >= finalNumber) {
                clearInterval(timer);
                activeTimers.delete(elementId);

                const finalDisplayValue = finalNumber / divisor;
                displayElement.textContent = formatNumber(finalDisplayValue, precision);
                unitElement.textContent = targetUnit;
            } else {
                displayElement.textContent = formatNumber(currentNumber, precision);
            }
        }, stepTime);

        activeTimers.set(elementId, timer);
    }

    const counterConfigurations = [
        { numberId: '.js-stat-year-digit', finalNumber: 10, durationMs: 2500, targetUnit: '', divisor: 1, precision: 0 },
        { numberId: '.js-stat-spot-digit', finalNumber: 1000, durationMs: 1500, targetUnit: 'K+', divisor: 1000, precision: 0 },
        { numberId: '.js-stat-client-digit', finalNumber: 10000, durationMs: 1000, targetUnit: 'K+', divisor: 1000, precision: 0 },
        { numberId: '.js-stat-rating-digit', finalNumber: 4.9, durationMs: 2000, targetUnit: '', divisor: 1, precision: 1 }
    ];

    const mainContainer = $('.stats');
    if (mainContainer) {
        // State untuk mencegah hitungan berjalan terus saat elemen masih di viewport
        let isCounting = false;

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                // KONDISI 1: Container terlihat DAN hitungan belum berjalan
                if (entry.isIntersecting && !isCounting) {

                    isCounting = true; // Tandai bahwa hitungan sedang berjalan

                    counterConfigurations.forEach(config => {
                        animateCounter(
                            config.numberId,
                            config.finalNumber,
                            config.durationMs,
                            config.targetUnit,
                            config.divisor,
                            config.precision
                        );
                    });

                // KONDISI 2: Container TIDAK terlihat (diperlukan untuk reset state)
                } else if (!entry.isIntersecting) {

                    // Reset flag agar hitungan bisa berjalan lagi saat masuk viewport
                    isCounting = false;

                    // Hentikan semua timer saat elemen keluar dari viewport
                    activeTimers.forEach(timer => clearInterval(timer));
                    activeTimers.clear();
                }
            });
        };

        const observerOptions = { root: null, threshold: 0.1 };
        const mainObserver = new IntersectionObserver(observerCallback, observerOptions);
        mainObserver.observe(mainContainer);
    }

    // =============================================================================
    // WORK SWIPER
    // =============================================================================
    const workMenu = ['Work', 'Billboard', 'Branding', 'Interior'];
    const workSwiper = new Swiper('.js-work-swiper', {
        direction: 'horizontal',
        spaceBetween: 20,
        autoHeight: true,
        loop: true,
        pagination: {
            el: '.js-work-nav',
            clickable: true,
            renderBullet: (index, className) => `<span class="${className} d-inline-block px-3 py-2 rounded-3">${workMenu[index]}</span>`
        }
    });

    const slideMap = {
        '.billboard.card': 1,
        '.branding.card': 2,
        '.interior.card': 3
    };

    Object.entries(slideMap).forEach(([selector, slideIndex]) => {
        $(selector)?.addEventListener('click', () => workSwiper.slideTo(slideIndex));
    });

    // =============================================================================
    // TESTIMONIAL
    // =============================================================================
    const testimonialWrapper = $('.js-testimonial-wrapper');
    const testimonialButtonLeft = $('.js-testimonial-button-left');
    const testimonialButtonRight = $('.js-testimonial-button-right');

    if (!testimonialWrapper || !testimonialButtonLeft || !testimonialButtonRight) return;

    const scrollDistance = 300;
    const dragSpeedMultiplier = 2;

    let isDown = false;
    let startX;
    let scrollLeft;

    const scrollContainer = (amount) => {
        testimonialWrapper.scrollBy({ left: amount, behavior: 'smooth' });
    };

    const handleStart = (e) => {
        isDown = true;
        testimonialWrapper.classList.add('active-drag');
        const clientX = e.pageX || e.touches?.[0].pageX;
        startX = clientX - testimonialWrapper.offsetLeft;
        scrollLeft = testimonialWrapper.scrollLeft;
    };

    const handleEnd = () => {
        isDown = false;
        testimonialWrapper.classList.remove('active-drag');
    };

    const handleMove = (e) => {
        if (!isDown) return;
        e.preventDefault();

        const clientX = e.pageX || e.touches?.[0].pageX;
        const x = clientX - testimonialWrapper.offsetLeft;
        const walk = (x - startX) * dragSpeedMultiplier;

        testimonialWrapper.scrollLeft = scrollLeft - walk;
    };

    const checkScrollPosition = () => {
        const { scrollLeft, scrollWidth, clientWidth } = testimonialWrapper;
        const isAtStart = scrollLeft <= 5;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5;

        const toggleDisabledClass = (element, isDisabled) => {
            element.classList.toggle('opacity-50', isDisabled);
            element.classList.toggle('cursor-not-allowed', isDisabled);
        };

        toggleDisabledClass(testimonialButtonLeft, isAtStart);
        toggleDisabledClass(testimonialButtonRight, isAtEnd);
    };

    // 1. Navigasi Tombol
    testimonialButtonLeft.addEventListener('click', () => scrollContainer(-scrollDistance));
    testimonialButtonRight.addEventListener('click', () => scrollContainer(scrollDistance));

    // 2. Scroll Roda Mouse
    testimonialWrapper.addEventListener('wheel', (event) => {
        event.preventDefault();
        testimonialWrapper.scrollBy({ left: event.deltaY, behavior: 'auto' });
    }, { passive: false });

    // 3. Drag-to-Scroll (Mouse & Touch)
    testimonialWrapper.addEventListener('mousedown', handleStart);
    testimonialWrapper.addEventListener('touchstart', handleStart, { passive: true });

    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(event => {
        testimonialWrapper.addEventListener(event, handleEnd);
    });

    testimonialWrapper.addEventListener('mousemove', handleMove);
    testimonialWrapper.addEventListener('touchmove', handleMove, { passive: false });

    // --- INISIALISASI ---
    testimonialWrapper.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition();
});
