// document.addEventListener('DOMContentLoaded', () => {

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
    // --- DEKLARASI VARIABEL DOM ---
    const testimonialWrapper = document.querySelector('.js-testimonial-wrapper');
    const testimonialButtonLeft = document.querySelector('.js-testimonial-button-left');
    const testimonialButtonRight = document.querySelector('.js-testimonial-button-right');
    const scrollDistance = 300; // Jarak scroll untuk tombol navigasi

    // --- STATE VARIABEL UNTUK DRAG TO SCROLL ---
    let isDown = false; // Status apakah mouse sedang ditekan
    let startX;         // Posisi X saat mouse mulai ditekan
    let scrollLeft;     // Posisi scroll saat mouse mulai ditekan

    /**
     * Fungsi untuk menggulir kontainer (digunakan oleh tombol)
     * @param {number} amount - Jumlah piksel yang akan digulir (positif untuk kanan, negatif untuk kiri).
     */
    function scrollContainer(amount) {
        testimonialWrapper.scrollBy({
            left: amount,
            behavior: 'smooth'
        });
        // checkScrollPosition() akan dipanggil otomatis oleh event 'scroll'
    }

    // --- EVENT LISTENER UNTUK TOMBOL NAVIGASI ---
    testimonialButtonLeft.addEventListener('click', () => {
        scrollContainer(-scrollDistance);
    });

    testimonialButtonRight.addEventListener('click', () => {
        scrollContainer(scrollDistance);
    });

    // --- SCROLL DENGAN MOUSE WHEEL ---
    testimonialWrapper.addEventListener('wheel', (event) => {
        // Memastikan guliran vertikal (bawaan browser) dinonaktifkan
        event.preventDefault();

        testimonialWrapper.scrollBy({
            left: event.deltaY, // Menggunakan deltaY untuk scroll horizontal
            behavior: 'auto'
        });
        // checkScrollPosition() // akan dipanggil otomatis oleh event 'scroll'
    });

    // --- DRAG TO SCROLL (MOUSE DOWN & MOBILE TOUCH) ---

    // 1. MOUSE DOWN (Mulai Drag)
    testimonialWrapper.addEventListener('mousedown', (e) => {
        // Periksa apakah kontainer ada
        if (!testimonialWrapper) return;

        isDown = true;
        // Tambahkan kelas CSS untuk mengubah kursor
        testimonialWrapper.classList.add('active-drag');

        // Catat posisi X awal kursor
        startX = e.pageX - testimonialWrapper.offsetLeft;
        // Catat posisi scroll saat ini
        scrollLeft = testimonialWrapper.scrollLeft;
    });

    // 2. MOUSE UP / MOUSE LEAVE (Akhiri Drag)
    testimonialWrapper.addEventListener('mouseup', () => {
        isDown = false;
        // Hapus kelas CSS
        testimonialWrapper.classList.remove('active-drag');
    });

    testimonialWrapper.addEventListener('mouseleave', () => {
        isDown = false;
        testimonialWrapper.classList.remove('active-drag');
    });

    // 3. MOUSE MOVE (Proses Dragging)
    testimonialWrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return; // Stop fungsi jika mouse tidak sedang ditekan
        e.preventDefault();

        // Hitung jarak pergerakan X
        const x = e.pageX - testimonialWrapper.offsetLeft;
        // Hitung seberapa jauh harus scroll (faktor 2 agar lebih cepat)
        const walk = (x - startX) * 2;

        // Terapkan posisi scroll baru
        testimonialWrapper.scrollLeft = scrollLeft - walk;
        // checkScrollPosition() akan dipanggil otomatis oleh event 'scroll'
    });

    // --- FUNGSI CHECK SCROLL POSITION ---
    function checkScrollPosition() {
        // Pastikan elemen ada sebelum diakses
        if (!testimonialWrapper || !testimonialButtonLeft || !testimonialButtonRight) return;

        const { scrollLeft, scrollWidth, clientWidth } = testimonialWrapper;

        // Tombol Kiri: Sembunyikan jika sudah di posisi paling kiri
        // Menggunakan kelas untuk fleksibilitas styling
        if (scrollLeft <= 5) {
            testimonialButtonLeft.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            testimonialButtonLeft.classList.remove('opacity-50', 'cursor-not-allowed');
        }

        // Tombol Kanan: Sembunyikan jika sudah di posisi paling kanan
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
            testimonialButtonRight.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            testimonialButtonRight.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    // --- INISIALISASI ---
    // Panggil saat halaman dimuat
    checkScrollPosition();
    // Panggil setiap kali kontainer digulir
    testimonialWrapper.addEventListener('scroll', checkScrollPosition);

// });
