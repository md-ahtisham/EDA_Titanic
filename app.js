// Presentation navigation and functionality
class PresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 8;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.currentSlideSpan = document.getElementById('current-slide');
        this.totalSlidesSpan = document.getElementById('total-slides');
        
        this.init();
    }
    
    init() {
        // Set initial values
        this.currentSlideSpan.textContent = this.currentSlide;
        this.totalSlidesSpan.textContent = this.totalSlides;
        
        // Bind event listeners with proper context
        this.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.previousSlide();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextSlide();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Initialize button states
        this.updateNavigationButtons();
        
        // Show first slide
        this.showSlide(this.currentSlide);
        
        console.log('Presentation controller initialized');
    }
    
    showSlide(slideNumber) {
        // Validate slide number
        if (slideNumber < 1 || slideNumber > this.totalSlides) {
            console.warn(`Invalid slide number: ${slideNumber}`);
            return;
        }
        
        // Hide all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Show current slide
        const currentSlideElement = document.getElementById(`slide-${slideNumber}`);
        if (currentSlideElement) {
            currentSlideElement.classList.add('active');
            console.log(`Showing slide ${slideNumber}`);
        } else {
            console.error(`Slide element not found: slide-${slideNumber}`);
            return;
        }
        
        // Update current slide reference
        this.currentSlide = slideNumber;
        
        // Update counter
        this.currentSlideSpan.textContent = slideNumber;
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Scroll to top of slide
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('slideChange', {
            detail: { slideNumber: slideNumber }
        }));
    }
    
    nextSlide() {
        console.log(`Next slide requested. Current: ${this.currentSlide}, Total: ${this.totalSlides}`);
        
        if (this.currentSlide < this.totalSlides) {
            this.showSlide(this.currentSlide + 1);
        } else {
            console.log('Already on last slide');
        }
    }
    
    previousSlide() {
        console.log(`Previous slide requested. Current: ${this.currentSlide}`);
        
        if (this.currentSlide > 1) {
            this.showSlide(this.currentSlide - 1);
        } else {
            console.log('Already on first slide');
        }
    }
    
    updateNavigationButtons() {
        // Update Previous button
        if (this.currentSlide <= 1) {
            this.prevBtn.disabled = true;
            this.prevBtn.classList.add('disabled');
            this.prevBtn.setAttribute('aria-disabled', 'true');
        } else {
            this.prevBtn.disabled = false;
            this.prevBtn.classList.remove('disabled');
            this.prevBtn.setAttribute('aria-disabled', 'false');
        }
        
        // Update Next button
        if (this.currentSlide >= this.totalSlides) {
            this.nextBtn.textContent = 'End';
            this.nextBtn.disabled = true;
            this.nextBtn.classList.add('disabled');
            this.nextBtn.setAttribute('aria-disabled', 'true');
        } else {
            this.nextBtn.textContent = 'Next';
            this.nextBtn.disabled = false;
            this.nextBtn.classList.remove('disabled');  
            this.nextBtn.setAttribute('aria-disabled', 'false');
        }
        
        console.log(`Navigation updated: Prev ${this.prevBtn.disabled ? 'disabled' : 'enabled'}, Next ${this.nextBtn.disabled ? 'disabled' : 'enabled'}`);
    }
    
    handleKeyboard(event) {
        // Only handle keyboard events if not typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(event.key) {
            case 'ArrowRight':
            case ' ': // Spacebar
                event.preventDefault();
                this.nextSlide();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.previousSlide();
                break;
            case 'Home':
                event.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                event.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'Escape':
                event.preventDefault();
                this.toggleFullscreen();
                break;
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
            this.showSlide(slideNumber);
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Enhanced chart interactions and animations
class ChartEnhancements {
    constructor() {
        this.init();
    }
    
    init() {
        this.addChartHoverEffects();
        this.addStatAnimations();
        this.addProgressiveReveal();
    }
    
    addChartHoverEffects() {
        const chartImages = document.querySelectorAll('.chart-image');
        
        chartImages.forEach(chart => {
            chart.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.02)';
                this.style.transition = 'transform 0.3s ease';
            });
            
            chart.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    addStatAnimations() {
        const statValues = document.querySelectorAll('.stat-value');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStatValue(entry.target);
                }
            });
        }, observerOptions);
        
        statValues.forEach(stat => {
            observer.observe(stat);
        });
    }
    
    animateStatValue(element) {
        const text = element.textContent;
        const hasPercent = text.includes('%');
        const hasNumber = /\d/.test(text);
        
        if (hasNumber && !element.classList.contains('animated')) {
            element.classList.add('animated');
            
            // Extract numeric value
            const matches = text.match(/[\d,]+\.?\d*/);
            if (matches) {
                const targetValue = parseFloat(matches[0].replace(',', ''));
                const suffix = text.replace(matches[0], '');
                
                this.countUpAnimation(element, 0, targetValue, suffix, 1000);
            }
        }
    }
    
    countUpAnimation(element, start, end, suffix, duration) {
        const startTime = performance.now();
        const range = end - start;
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (range * easeOut);
            
            // Format number
            let displayValue;
            if (end >= 1000) {
                displayValue = Math.round(current).toLocaleString();
            } else if (end % 1 !== 0) {
                displayValue = current.toFixed(1);
            } else {
                displayValue = Math.round(current);
            }
            
            element.textContent = displayValue + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
    
    addProgressiveReveal() {
        const revealElements = document.querySelectorAll('.finding-card, .agenda-item, .overview-card');
        
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -30px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 150);
                }
            });
        }, observerOptions);
        
        revealElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }
}

// Accessibility enhancements
class AccessibilityEnhancements {
    constructor() {
        this.init();
    }
    
    init() {
        this.addAriaLabels();
        this.addFocusManagement();
        this.addScreenReaderSupport();
    }
    
    addAriaLabels() {
        // Add aria labels to navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) prevBtn.setAttribute('aria-label', 'Go to previous slide');
        if (nextBtn) nextBtn.setAttribute('aria-label', 'Go to next slide');
        
        // Add slide landmarks
        const slides = document.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            slide.setAttribute('role', 'region');
            slide.setAttribute('aria-label', `Slide ${index + 1} of ${slides.length}`);
        });
    }
    
    addFocusManagement() {
        // Ensure proper focus management when navigating slides  
        const slides = document.querySelectorAll('.slide');
        
        slides.forEach(slide => {
            const firstFocusable = slide.querySelector('h1, h2, h3, button, a, input, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                slide.addEventListener('slideshow', () => {
                    firstFocusable.focus();
                });
            }
        });
    }
    
    addScreenReaderSupport() {
        // Announce slide changes to screen readers
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
        
        // Listen for slide changes
        document.addEventListener('slideChange', (e) => {
            const slideNumber = e.detail.slideNumber;
            const slide = document.getElementById(`slide-${slideNumber}`);
            if (slide) {
                const slideTitle = slide.querySelector('h1, h2, h3');
                if (slideTitle) {
                    announcer.textContent = `Now viewing slide ${slideNumber}: ${slideTitle.textContent}`;
                }
            }
        });
    }
}

// Performance optimizations
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.lazyLoadImages();
        this.optimizeAnimations();
    }
    
    lazyLoadImages() {
        const images = document.querySelectorAll('.chart-image');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease';
                    
                    img.onload = () => {
                        img.style.opacity = '1';
                    };
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    optimizeAnimations() {
        // Reduce animations on devices with reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Force images to stay visible
function forceImageVisibility() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.display = 'block';
        img.style.visibility = 'visible';
        img.style.opacity = '1';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
    });
}

// Global presentation instance
let presentationInstance = null;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Titanic EDA Presentation');
    
    // Initialize core functionality
    presentationInstance = new PresentationController();
    const chartEnhancements = new ChartEnhancements();
    const accessibility = new AccessibilityEnhancements();
    const performance = new PerformanceOptimizer();
    
    // Add slide change event listener
    document.addEventListener('slideChange', function(e) {
        console.log(`Slide changed to: ${e.detail.slideNumber}`);
    });
    
    // Handle window resize for responsive behavior
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('Window resized - layout adjusted');
        }, 250);
    });
    
    // Add loading state management
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        console.log('Presentation fully loaded and ready');
    });
    
    // Handle print functionality
    window.addEventListener('beforeprint', function() {
        // Show all slides for printing
        document.querySelectorAll('.slide').forEach(slide => {
            slide.style.display = 'block';
        });
    });
    
    window.addEventListener('afterprint', function() {
        // Restore normal slide visibility
        if (presentationInstance) {
            presentationInstance.showSlide(presentationInstance.currentSlide);
        }
    });
    
    // Force image visibility on page load
    forceImageVisibility();
    
    // Override the showSlide function to include image fix
    const originalShowSlide = PresentationController.prototype.showSlide;
    PresentationController.prototype.showSlide = function(slideNumber) {
        originalShowSlide.call(this, slideNumber);
        setTimeout(forceImageVisibility, 100); // Ensure images stay visible
    };
    
    console.log('Titanic EDA Presentation initialized successfully');
});