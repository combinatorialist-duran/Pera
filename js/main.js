// Main JavaScript functionality
class PeraCafe {
    constructor() {
        this.currentLang = localStorage.getItem('pera-lang') || 'tr';
        this.isNavOpen = false;
        this.lightboxOpen = false;
    }

    init() {
        this.setupLanguage();
        this.setupNavigation();
        this.setupSmoothScroll();
        this.setupScrollEffects();
        this.setupLightbox();
        this.setupMobileMenu();
        this.setupSliders();
        this.initMenu();
        this.updateContent();
    }

    // Language Management 
    setupLanguage() {
        const langBtn = document.getElementById('lang-toggle');
        if (langBtn) {
            langBtn.addEventListener('click', () => this.toggleLanguage());
            this.updateLangButton();
        }
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'tr' ? 'en' : 'tr';
        localStorage.setItem('pera-lang', this.currentLang);
        this.updateContent();
        this.updateLangButton();
        if (typeof menuManager !== 'undefined') {
            menuManager.setLanguage(this.currentLang);
        }
    }

    updateLangButton() {
        const langBtn = document.getElementById('lang-toggle');
        if (langBtn) {
            langBtn.textContent = this.currentLang === 'tr' ? 'EN' : 'TR';
        }
    }

    updateContent() {
        const t = translations[this.currentLang];
        
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = this.getNestedValue(t, key);
            if (value) {
                el.textContent = value;
            }
        });

        // Update menu filter buttons
        this.updateMenuFilters();
    }

    getNestedValue(obj, key) {
        return key.split('.').reduce((o, k) => (o || {})[k], obj);
    }

    updateMenuFilters() {
        const t = translations[this.currentLang].menu;
        const filters = document.querySelectorAll('.menu-filter-btn');
        filters.forEach(btn => {
            const category = btn.dataset.category;
            const textMap = {
                'all': t.all,
                'breakfast': t.breakfast,
                'appetizers': t.appetizers,
                'desserts': t.desserts,
                'hot': t.hotDrinks,
                'cold': t.coldDrinks
            };
            if (textMap[category]) {
                btn.textContent = textMap[category];
            }
        });
    }

    // Navigation
    setupNavigation() {
        const navbar = document.getElementById('navbar');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Add/remove scrolled class
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    setupMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('nav-links');
        const navLinksItems = document.querySelectorAll('.nav-links a');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                this.isNavOpen = !this.isNavOpen;
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
                document.body.classList.toggle('nav-open');
            });

            // Close menu when clicking a link
            navLinksItems.forEach(link => {
                link.addEventListener('click', () => {
                    this.isNavOpen = false;
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.classList.remove('nav-open');
                });
            });
        }
    }

    // Smooth Scroll
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    const navHeight = document.getElementById('navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Scroll Effects
    setupScrollEffects() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right').forEach(el => {
            observer.observe(el);
        });
    }

    // Lightbox for Gallery
    setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxVideo = document.getElementById('lightbox-video');
        const lightboxClose = document.getElementById('lightbox-close');
        const galleryItems = document.querySelectorAll('.gallery-item');

        if (!lightbox) return;

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const video = item.querySelector('video');
                
                if (video) {
                    lightboxImg.style.display = 'none';
                    lightboxVideo.style.display = 'block';
                    lightboxVideo.src = video.src;
                    lightboxVideo.play();
                } else if (img) {
                    lightboxVideo.style.display = 'none';
                    lightboxVideo.pause();
                    lightboxImg.style.display = 'block';
                    lightboxImg.src = img.src;
                    lightboxImg.alt = img.alt;
                }
                
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                this.lightboxOpen = true;
            });
        });

        // Close lightbox
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            lightboxVideo.pause();
            lightboxVideo.src = '';
            this.lightboxOpen = false;
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightboxOpen) {
                closeLightbox();
            }
        });
    }

    // Event Sliders
    setupSliders() {
        const sliders = document.querySelectorAll('.event-card-slider');
        
        sliders.forEach(slider => {
            const slides = slider.querySelectorAll('.slider-slide');
            const prevBtn = slider.querySelector('.slider-prev');
            const nextBtn = slider.querySelector('.slider-next');
            const dotsContainer = slider.querySelector('.slider-dots');
            let currentIndex = 0;
            let autoPlayInterval = null;
            
            // Create dots
            slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Slide ${index + 1}`);
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
            
            const dots = dotsContainer.querySelectorAll('.slider-dot');
            
            function goToSlide(index) {
                // Stop any playing video
                const currentVideo = slides[currentIndex].querySelector('video');
                if (currentVideo) {
                    currentVideo.pause();
                    currentVideo.currentTime = 0;
                }
                
                slides[currentIndex].classList.remove('active');
                dots[currentIndex].classList.remove('active');
                
                currentIndex = index;
                if (currentIndex >= slides.length) currentIndex = 0;
                if (currentIndex < 0) currentIndex = slides.length - 1;
                
                slides[currentIndex].classList.add('active');
                dots[currentIndex].classList.add('active');
                
                // Auto-play video if current slide has video
                const newVideo = slides[currentIndex].querySelector('video');
                if (newVideo) {
                    newVideo.play();
                }
            }
            
            function nextSlide() {
                goToSlide(currentIndex + 1);
            }
            
            function prevSlide() {
                goToSlide(currentIndex - 1);
            }
            
            // Button events
            if (nextBtn) nextBtn.addEventListener('click', nextSlide);
            if (prevBtn) prevBtn.addEventListener('click', prevSlide);
            
            // Auto-play
            function startAutoPlay() {
                autoPlayInterval = setInterval(nextSlide, 5000);
            }
            
            function stopAutoPlay() {
                if (autoPlayInterval) {
                    clearInterval(autoPlayInterval);
                    autoPlayInterval = null;
                }
            }
            
            // Pause auto-play on hover
            slider.addEventListener('mouseenter', stopAutoPlay);
            slider.addEventListener('mouseleave', startAutoPlay);
            
            // Touch/swipe support
            let touchStartX = 0;
            let touchEndX = 0;
            
            slider.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                stopAutoPlay();
            }, { passive: true });
            
            slider.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
                startAutoPlay();
            }, { passive: true });
            
            function handleSwipe() {
                const swipeThreshold = 50;
                const diff = touchStartX - touchEndX;
                
                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                }
            }
            
            // Video click to play/pause
            slides.forEach(slide => {
                const video = slide.querySelector('video');
                if (video) {
                    video.addEventListener('click', () => {
                        if (video.paused) {
                            video.play();
                        } else {
                            video.pause();
                        }
                    });
                }
            });
            
            // Start auto-play
            startAutoPlay();
        });
    }

    // Initialize Menu
    async initMenu() {
        if (typeof menuManager !== 'undefined') {
            menuManager.currentLang = this.currentLang;
            await menuManager.init();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new PeraCafe();
    app.init();
    
    // Scroll to section if hash exists in URL
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const navHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, 300);
    }
});

// Add parallax effect to hero
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
    }
});

