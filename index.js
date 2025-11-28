//
// MAIN MENU
//
const navObj = {
    '.js-main-nav-work': '.work-header',
    '.js-main-nav-porto': '.portofolio-header',
    '.js-main-nav-client': '.client-header',
    '.js-main-nav-contact': '.contact-info'
};
for (const [key, val] of Object.entries(navObj)) {
    document.querySelector(key).addEventListener('click', () => {
        document.querySelector(val).scrollIntoView({ behavior: 'smooth' });
    });
}

//
// SWIPER
//
var workMenu = ['Work', 'Billboard', 'Branding', 'Interior'];
const workSwiper = new Swiper('.work-swiper', {
    direction: 'horizontal',
    spaceBetween: 20,
    loop: true,
    pagination: {
        el: '.work-nav',
        clickable: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '">' + (workMenu[index]) + '</span>';
        }
    }
});
document.querySelector('.index.billboard').addEventListener('click', () => workSwiper.slideTo(1));
document.querySelector('.index.branding').addEventListener('click', () => workSwiper.slideTo(2));
document.querySelector('.index.interior').addEventListener('click', () => workSwiper.slideTo(3));

//
// COUNTER
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
const mainContainer = document.getElementById('stats');

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
// TESTI SCROLL
//
const scrollContainer = document.querySelector(".testimonial-wrapper");
scrollContainer.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    scrollContainer.scrollLeft += evt.deltaY;
});
