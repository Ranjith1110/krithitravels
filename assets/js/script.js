// =======================================================
// PRELOADER & COMPONENT ORCHESTRATOR
// =======================================================

// 1. Inject Preloader IMMEDIATELY to prevent Image Flash
(function injectPreloaderSynchronously() {
    // We inject this directly via JS so it blocks the screen before images can render
    const loaderHTML = `
        <div id="site-preloader" class="fixed inset-0 z-[99999] bg-[#f8f9fa] flex items-center justify-center transition-opacity duration-500" style="opacity: 1;">
            <canvas id="dotlottie-canvas" style="width: 300px; height: 300px;"></canvas>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    document.body.style.overflow = 'hidden'; // Lock scrolling
})();

// 2. Initialize the Lottie Animation
async function initLottieLoader() {
    try {
        const canvasElement = document.querySelector('#dotlottie-canvas');
        if (!canvasElement) return;

        // Dynamically import DotLottie to handle the animation without breaking existing script tags
        const { DotLottie } = await import('https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web/+esm');

        new DotLottie({
            autoplay: true,
            loop: true,
            canvas: canvasElement,
            src: "assets/images/travel.lottie", // Your local lottie file
        });
    } catch (error) {
        console.error("Error loading Lottie animation:", error);
    }
}

// 3. Hide Preloader smoothly
function hidePreloader() {
    const preloader = document.getElementById('site-preloader');
    if (preloader) {
        preloader.style.opacity = '0'; // Trigger CSS transition
        document.body.style.overflow = ''; // Restore scrolling

        setTimeout(() => {
            preloader.remove(); // Remove from DOM after fade completes
        }, 500);
    } else {
        document.body.style.overflow = '';
    }
}

// 4. Initialize Site: Orchestrate loading sequence
function initializeSite() {
    // Load the animation graphics
    initLottieLoader();

    // STRICT 6-SECOND TIMER for the loader
    setTimeout(() => {
        hidePreloader();
    }, 6000);

    // Load navbar and footer concurrently in the background while loader runs
    Promise.all([loadNavbar(), loadFooter()]);
}


// =======================================================
// GLOBAL COMPONENTS (Navbar & Footer)
// =======================================================

// Navbar Start
async function loadNavbar() {
    try {
        const response = await fetch('components/navbar.html');

        if (!response.ok) {
            throw new Error('Could not load navbar. Make sure you are running a Local Server.');
        }

        const html = await response.text();
        const navContainer = document.getElementById('navbar-container');
        if (navContainer) {
            navContainer.innerHTML = html;
            initNavbarScripts();
        }

    } catch (error) {
        console.error("Error:", error);
        if (document.getElementById('navbar-container')) {
            document.getElementById('navbar-container').innerHTML = "<p class='text-red-500 text-center py-4'>Error loading navbar. Please open this via 'Live Server'.</p>";
        }
    }
}

function initNavbarScripts() {
    const navbar = document.getElementById('navbar');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    window.addEventListener('scroll', () => {
        if (!navbar) return;

        const currentScrollY = window.scrollY;
        if (currentScrollY === 0) {
            navbar.classList.remove('fixed', 'nav-hidden', 'shadow-md');
            navbar.classList.add('absolute', 'nav-visible');
        }
        else if (currentScrollY > 0 && currentScrollY < 200) {
            navbar.classList.remove('nav-visible');
            navbar.classList.add('nav-hidden');
        }
        else if (currentScrollY >= 200) {
            navbar.classList.remove('absolute', 'nav-hidden');
            navbar.classList.add('fixed', 'nav-visible', 'shadow-md');
        }
    });
}
// Navbar End

// Footer Start
async function loadFooter() {
    try {
        const response = await fetch('components/footer.html');

        if (!response.ok) {
            throw new Error('Could not load footer. Make sure you are running Live Server.');
        }

        const html = await response.text();
        if (document.getElementById('footer-container')) {
            document.getElementById('footer-container').innerHTML = html;
        }

    } catch (error) {
        console.error("Error:", error);
        if (document.getElementById('footer-container')) {
            document.getElementById('footer-container').innerHTML =
                "<p class='text-red-500 text-center py-4'>Error loading footer. Please open via Live Server.</p>";
        }
    }
}
// Footer End

// Execute Initializer immediately
initializeSite();


// =======================================================
// PAGE SPECIFIC SCRIPTS (With Safety Checks)
// =======================================================

// Hero Swiper Start
const hero = document.getElementById("heroSection");
if (hero) {
    const title = document.getElementById("heroTitle");
    const subtitle = document.getElementById("heroSubtitle");

    const cards = {
        1: document.getElementById("card1"),
        2: document.getElementById("card2"),
        3: document.getElementById("card3"),
        4: document.getElementById("card4"),
    };

    const slides = {
        1: { img: "assets/images/destination/destination1.jpg", title: "Hire Cabs in Rameswaram", subtitle: "Best Taxi Services with 24/7 Support" },
        2: { img: "assets/images/destination/destination2.jpg", title: "Rameswaram Tour Packages", subtitle: "Explore all tourist places comfortably" },
        3: { img: "assets/images/destination/destination3.jpg", title: "Top Attractions in Rameswaram", subtitle: "Visit all the famous sightseeing spots" },
        4: { img: "assets/images/destination/destination4.jpg", title: "Hotels & Resorts", subtitle: "Find the best rated hotels for your stay" }
    };

    let current = 1;
    let autoSlide;

    window.manualChange = function (index) {
        clearInterval(autoSlide);
        current = index;
        changeHero(index);
        autoSlideStart();
    };

    function setActive(index) {
        Object.values(cards).forEach(c => c.classList.remove("active"));
        if (cards[index]) cards[index].classList.add("active");
    }

    function changeHero(index) {
        hero.style.opacity = 0;

        setTimeout(() => {
            hero.style.backgroundImage = `url('${slides[index].img}')`;
            if (title) title.innerText = slides[index].title;
            if (subtitle) subtitle.innerText = slides[index].subtitle;
            hero.style.opacity = 1;
        }, 300);

        setActive(index);
    }

    function autoSlideStart() {
        autoSlide = setInterval(() => {
            current = current === 4 ? 1 : current + 1;
            changeHero(current);
        }, 6000);
    }

    setActive(1);
    autoSlideStart();
}
// Hero Swiper End

// Counter Animation Start
const counterSection = document.querySelector("#counter-section");
if (counterSection) {
    function startCounter(counter) {
        const target = +counter.getAttribute('data-target');
        let count = 0;

        const updateCount = () => {
            count += Math.ceil(target / 50);
            if (count < target) {
                counter.innerText = count;
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                document.querySelectorAll(".counter").forEach(counter => startCounter(counter));
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });

    observer.observe(counterSection);
}
// Counter Animation End

// Load More / Load Less Functionality
document.addEventListener('DOMContentLoaded', function () {
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadLessBtn = document.getElementById('load-less-btn');

    if (loadMoreBtn && loadLessBtn) {
        const cards = document.querySelectorAll('.package-card');
        const itemsToShow = 8;

        loadMoreBtn.addEventListener('click', function () {
            const hiddenCards = document.querySelectorAll('.package-card.hidden');
            hiddenCards.forEach(card => {
                card.classList.remove('hidden');
            });

            loadMoreBtn.classList.add('hidden');
            loadLessBtn.classList.remove('hidden');
        });

        loadLessBtn.addEventListener('click', function () {
            cards.forEach((card, index) => {
                if (index >= itemsToShow) {
                    card.classList.add('hidden');
                }
            });

            loadLessBtn.classList.add('hidden');
            loadMoreBtn.classList.remove('hidden');

            document.getElementById('packages-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
});
// Load More / Load Less End

// Testimonial Swiper Start
const testimonialContainer = document.querySelector(".mySwiper");
if (testimonialContainer) {
    var swiper = new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        effect: "fade",
        fadeEffect: { crossFade: true },
        navigation: {
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
        },
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
    });
}
// Testimonial Swiper End