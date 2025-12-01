document.addEventListener('DOMContentLoaded', () => {

    // =============================================================================
    // MAIN MENU
    // =============================================================================
    const navObj = {
        '.js-work-main-nav': '.work',
        '.js-porto-main-nav': '.portofolio',
        '.js-client-main-nav': '.client',
        '.js-contact-main-nav': '.contact'
    };
    for (const [key, val] of Object.entries(navObj)) {
        document.querySelector(key).addEventListener('click', (ev) => {
            ev.preventDefault();
            document.querySelector(val).scrollIntoView({ behavior: 'smooth' });
        });
    }

    // =============================================================================
    // STATS
    // =============================================================================

    // Variabel global untuk menyimpan ID timer aktif
    const activeTimers = new Map();
    // Flag untuk memastikan fungsi hanya berjalan sekali per kali container masuk viewport
    let isContainerVisible = false;

    // --- FUNGSI UTAMA HITUNGAN (TIDAK BERUBAH) ---
    function animateCounter(elementId, finalNumber, durationMs, unitId, targetUnit, divisor = 1, precision = 0) {
        // Logika penghentian timer lama (berdasarkan ID elemen angka)
        const existingTimer = activeTimers.get(elementId);
        if (existingTimer) {
            clearInterval(existingTimer);
            activeTimers.delete(elementId);
        }

        const displayElement = document.querySelector(elementId);
        const unitElement = document.querySelector(unitId);

        let currentNumber = 0;
        const stepTime = 10;
        const totalSteps = durationMs / stepTime;
        const increment = finalNumber / totalSteps;

        const formatNumber = (num, digits) => num.toFixed(digits).replace('.', ',');

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
                unitElement.textContent = '';
            }
        }, stepTime);

        activeTimers.set(elementId, timer);
    }

    // --- KONFIGURASI UNTUK SETIAP ELEMEN CHILD (DIBUAT SEKALI) ---
    const counterConfigurations = [
        { numberId: '.js-stat-year-digit', finalNumber: 10, durationMs: 2500, targetUnit: '', divisor: 1, precision: 0 },
        { numberId: '.js-stat-spot-digit', finalNumber: 1000, durationMs: 1500, targetUnit: 'K+', divisor: 1000, precision: 0 },
        { numberId: '.js-stat-client-digit', finalNumber: 10000, durationMs: 1000, targetUnit: 'K+', divisor: 1000, precision: 0 },
        { numberId: '.js-stat-rating-digit', finalNumber: 4.9, durationMs: 2000, targetUnit: '', divisor: 1, precision: 1 }
    ];

    // LOGIKA UTAMA: Intersection Observer (Delegasi)

    // 1. Dapatkan elemen parent yang akan dipantau
    const mainContainer = document.querySelector('.stats');

    // 2. Callback untuk Observer
    const observerCallback = (entries) => {
        entries.forEach(entry => {
            // Jika container terlihat DAN belum pernah terlihat pada sesi ini
            if (entry.isIntersecting && !isContainerVisible) {

                // Tandai container sebagai terlihat (agar tidak berjalan berulang)
                // Hapus baris ini jika Anda ingin dijalankan SETIAP kali muncul
                // isContainerVisible = true;

                // console.log('Container terlihat! Menjalankan semua hitungan...');

                // Lakukan iterasi pada setiap konfigurasi dan jalankan animateCounter
                counterConfigurations.forEach(config => {
                    // Pastikan unit ID disesuaikan dengan number ID
                    const unitId = config.numberId.replace('digit', 'unit');

                    animateCounter(
                        config.numberId,
                        config.finalNumber,
                        config.durationMs,
                        unitId,
                        config.targetUnit,
                        config.divisor,
                        config.precision
                    );
                });

            } else if (!entry.isIntersecting) {
                // Opsional: Reset flag saat container keluar dari viewport
                // Gunakan ini JIKA Anda ingin hitungan berjalan SETIAP KALI masuk
                // isContainerVisible = false;
            }
        });
    };

    // 3. Buat dan mulai Observer
    const observerOptions = {
        root: null,
        threshold: 0.1 // Mulai ketika 10% dari container parent terlihat
    };

    const mainObserver = new IntersectionObserver(observerCallback, observerOptions);
    mainObserver.observe(mainContainer);

    // =============================================================================
    // WORK SWIPER
    // =============================================================================
    var workMenu = ['Work', 'Billboard', 'Branding', 'Interior'];
    const workSwiper = new Swiper('.js-work-swiper', {
        direction: 'horizontal',
        spaceBetween: 20,
        autoHeight: true,
        loop: true,
        pagination: {
            el: '.js-work-nav',
            clickable: true,
            renderBullet: function (index, className) {
                return '<span class="' + className + ' d-inline-block px-2 py-1 rounded-3 text-reset">' + (workMenu[index]) + '</span>';
            }
        }
    });
    document.querySelector('.billboard.card').addEventListener('click', () => workSwiper.slideTo(1));
    document.querySelector('.branding.card').addEventListener('click', () => workSwiper.slideTo(2));
    document.querySelector('.interior.card').addEventListener('click', () => workSwiper.slideTo(3));

    // =============================================================================
    // TESTIMONIAL
    // =============================================================================
    // --- DEKLARASI VARIABEL DOM & STATE ---
    const testimonialWrapper = document.querySelector('.js-testimonial-wrapper');
    const testimonialButtonLeft = document.querySelector('.js-testimonial-button-left');
    const testimonialButtonRight = document.querySelector('.js-testimonial-button-right');

    // Pastikan elemen ada sebelum melanjutkan
    if (!testimonialWrapper || !testimonialButtonLeft || !testimonialButtonRight) {
        console.error("Salah satu elemen testimonial tidak ditemukan.");
        return;
    }

    const scrollDistance = 300; // Jarak scroll untuk tombol navigasi

    let isDown = false;
    let startX;
    let scrollLeft;
    const dragSpeedMultiplier = 2; // Faktor kecepatan drag

    // --- FUNGSI UTAMA UNTUK GULIR (DIGUNAKAN TOMBOL) ---
    function scrollContainer(amount) {
        testimonialWrapper.scrollBy({
            left: amount,
            behavior: 'smooth'
        });
    }

    // --- FUNGSI INTI UNTUK MEMULAI DRAG/TOUCH ---
    function handleStart(e) {
        isDown = true;
        testimonialWrapper.classList.add('active-drag');

        // Tentukan koordinat X: menggunakan e.pageX untuk mouse, atau e.touches[0].pageX untuk touch
        const clientX = e.pageX || e.touches[0].pageX;

        startX = clientX - testimonialWrapper.offsetLeft;
        scrollLeft = testimonialWrapper.scrollLeft;
    }

    // --- FUNGSI INTI UNTUK MENGAKHIRI DRAG/TOUCH ---
    function handleEnd() {
        isDown = false;
        testimonialWrapper.classList.remove('active-drag');
    }

    // --- FUNGSI INTI UNTUK PERGERAKAN DRAG/TOUCH ---
    function handleMove(e) {
        if (!isDown) return;

        // Mencegah pemilihan teks pada desktop, atau gulir vertikal default pada mobile
        e.preventDefault();

        // Tentukan koordinat X
        const clientX = e.pageX || e.touches[0].pageX;

        const x = clientX - testimonialWrapper.offsetLeft;
        const walk = (x - startX) * dragSpeedMultiplier; // Menggunakan faktor pengali

        testimonialWrapper.scrollLeft = scrollLeft - walk;
    }

    // --- EVENT LISTENERS ---

    // 1. Navigasi Tombol
    testimonialButtonLeft.addEventListener('click', () => scrollContainer(-scrollDistance));
    testimonialButtonRight.addEventListener('click', () => scrollContainer(scrollDistance));

    // 2. Scroll Roda Mouse
    testimonialWrapper.addEventListener('wheel', (event) => {
        event.preventDefault();
        testimonialWrapper.scrollBy({
            left: event.deltaY,
            behavior: 'auto'
        });
    });

    // 3. Drag-to-Scroll (Mouse & Touch)
    testimonialWrapper.addEventListener('mousedown', handleStart);
    testimonialWrapper.addEventListener('touchstart', handleStart, { passive: true });

    testimonialWrapper.addEventListener('mouseup', handleEnd);
    testimonialWrapper.addEventListener('mouseleave', handleEnd);
    testimonialWrapper.addEventListener('touchend', handleEnd);
    testimonialWrapper.addEventListener('touchcancel', handleEnd);

    testimonialWrapper.addEventListener('mousemove', handleMove);
    testimonialWrapper.addEventListener('touchmove', handleMove);


    // --- FUNGSI CHECK SCROLL POSITION (TETAP SAMA) ---
    function checkScrollPosition() {
        const { scrollLeft, scrollWidth, clientWidth } = testimonialWrapper;

        // Tombol Kiri
        if (scrollLeft <= 5) {
            testimonialButtonLeft.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            testimonialButtonLeft.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        // Tombol Kanan
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
            testimonialButtonRight.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            testimonialButtonRight.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    // --- INISIALISASI ---
    checkScrollPosition();
    testimonialWrapper.addEventListener('scroll', checkScrollPosition);

});
