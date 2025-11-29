//
// MAIN MENU
//
const navObj = {
    '.js-main-nav-work': '.work',
    '.js-main-nav-porto': '.portofolio',
    '.js-main-nav-client': '.client',
    '.js-main-nav-contact': '.contact'
};
for (const [key, val] of Object.entries(navObj)) {
    document.querySelector(key).addEventListener('click', (ev) => {
        ev.preventDefault();
        document.querySelector(val).scrollIntoView({ behavior: 'smooth' });
    });
}

//
// STATS
//

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

    const displayElement = document.getElementById(elementId);
    const unitElement = document.getElementById(unitId);

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
    { numberId: 'js-stat-year-digit', finalNumber: 10, durationMs: 2500, targetUnit: '', divisor: 1, precision: 0 },
    { numberId: 'js-stat-spot-digit', finalNumber: 1000, durationMs: 1500, targetUnit: 'K+', divisor: 1000, precision: 0 },
    { numberId: 'js-stat-client-digit', finalNumber: 10000, durationMs: 1000, targetUnit: 'K+', divisor: 1000, precision: 0 },
    { numberId: 'js-stat-rating-digit', finalNumber: 4.9, durationMs: 2000, targetUnit: '', divisor: 1, precision: 1 }
];

// ------------------------------------------------------------------
// LOGIKA UTAMA: Intersection Observer (Delegasi)
// ------------------------------------------------------------------

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

//
// WORK SWIPER
//
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
            return '<span class="' + className + ' px-2 py-1 rounded-3 text-reset">' + (workMenu[index]) + '</span>';
        }
    }
});
document.querySelector('.index.billboard').addEventListener('click', () => workSwiper.slideTo(1));
document.querySelector('.index.branding').addEventListener('click', () => workSwiper.slideTo(2));
document.querySelector('.index.interior').addEventListener('click', () => workSwiper.slideTo(3));

//
// TESTIMONIAL
//
// Ambil elemen-elemen yang diperlukan dari DOM
const testimonialWrapper = document.querySelector('.js-testimonial-wrapper');
const testimonialButtonLeft = document.querySelector('.js-testimonial-button-left');
const testimonialButtonRight = document.querySelector('.js-testimonial-button-right');

// Tentukan seberapa jauh scroll setiap kali tombol diklik
const scrollDistance = 300; // Misalnya, gulir sejauh 300 piksel

/**
 * Fungsi untuk menggulir kontainer
 * @param {number} amount - Jumlah piksel yang akan digulir (positif untuk kanan, negatif untuk kiri).
 */
function scrollContainer(amount) {
    // Properti 'scrollLeft' digunakan untuk mengatur posisi horizontal scroll.
    // 'behavior: "smooth"' memberikan efek gulir yang lebih halus.
    testimonialWrapper.scrollBy({
        left: amount,
        behavior: 'smooth'
    });
}

// Tambahkan event listener untuk tombol kiri
testimonialButtonLeft.addEventListener('click', () => {
    // Gulir ke kiri, jadi jumlahnya negatif
    scrollContainer(-scrollDistance);
});

// Tambahkan event listener untuk tombol kanan
testimonialButtonRight.addEventListener('click', () => {
    // Gulir ke kanan, jadi jumlahnya positif
    scrollContainer(scrollDistance);
});

// --- Scroll Mouse Wheel ---
testimonialWrapper.addEventListener('wheel', (event) => {
    // Memastikan guliran vertikal (bawaan browser) dinonaktifkan
    event.preventDefault();

    // Properti 'deltaY' pada event wheel memberikan nilai guliran vertikal (ke atas/bawah).
    // Karena kita ingin menggulir secara horizontal, kita gunakan nilai deltaY untuk mengatur 'scrollLeft'.
    // Nilai negatif deltaY berarti gulir ke atas (kita terjemahkan sebagai gulir ke KIRI).
    // Nilai positif deltaY berarti gulir ke bawah (kita terjemahkan sebagai gulir ke KANAN).

    testimonialWrapper.scrollBy({
        left: event.deltaY, // Menggunakan deltaY untuk scroll horizontal (left)
        behavior: 'auto' // Menggunakan 'auto' agar terasa lebih responsif seperti guliran biasa
    });

    // Panggil checkScrollPosition untuk memperbarui tampilan tombol setelah scroll
    // checkScrollPosition();
});

// Sembunyikan tombol jika tidak ada lagi yang bisa di-scroll
function checkScrollPosition() {
    const { scrollLeft, scrollWidth, clientWidth } = testimonialWrapper;

    // Tombol Kiri: Sembunyikan jika sudah di posisi paling kiri (scrollLeft <= 0)
    if (scrollLeft <= 5) { // Beri sedikit margin untuk akurasi
        testimonialButtonLeft.style.display = 'none';
    } else {
        testimonialButtonLeft.style.display = 'block';
    }

    // Tombol Kanan: Sembunyikan jika sudah di posisi paling kanan
    // scrollWidth adalah total lebar konten, clientWidth adalah lebar kontainer yang terlihat.
    if (scrollLeft + clientWidth >= scrollWidth - 5) { // Beri sedikit margin untuk akurasi
        testimonialButtonRight.style.display = 'none';
    } else {
        testimonialButtonRight.style.display = 'block';
    }
}
// Panggil saat halaman dimuat
// checkScrollPosition();
// Panggil setiap kali kontainer digulir
// testimonialWrapper.addEventListener('scroll', checkScrollPosition);
