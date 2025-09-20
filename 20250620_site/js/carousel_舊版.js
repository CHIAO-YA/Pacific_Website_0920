const carousel = {
    currentSlide: 0,
    slides: null,
    indicators: null,
    inner: null,
    interval: 5000,

    init() {
        this.slides = document.querySelectorAll('.carousel-item');
        this.indicators = document.querySelectorAll('.carousel-indicator');
        this.inner = document.querySelector('.carousel-inner');

        if (!this.inner || this.slides.length === 0) {
            console.error('Carousel elements not found!');
            return;
        }

        // 初始時暫停所有影片，僅播放第一個
        this.slides.forEach((slide, index) => {
            const video = slide.querySelector('video');
            if (video) {
                if (index === 0) {
                    video.play();
                } else {
                    video.pause();
                }
            }
        });

        this.update();
        this.startAutoPlay();
        this.bindEvents();
    },

    update() {
        const slideWidthPercentage = 100 / this.slides.length; // 動態計算每張的寬度百分比
        this.inner.style.transform = `translateX(-${this.currentSlide * slideWidthPercentage}%)`;
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });

        // 切換時控制影片播放
        this.slides.forEach((slide, index) => {
            const video = slide.querySelector('video');
            if (video) {
                if (index === this.currentSlide) {
                    video.play();
                } else {
                    video.pause();
                }
            }
        });
    },

    startAutoPlay() {
        this.timer = setInterval(() => {
            this.next();
        }, this.interval);
    },

    resetAutoPlay() {
        clearInterval(this.timer);
        this.startAutoPlay();
    },

    next() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.update();
    },

    prev() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.update();
    },

    bindEvents() {
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.currentSlide = index;
                this.update();
                this.resetAutoPlay();
            });
        });
        document.querySelector('.carousel-control-prev').addEventListener('click', () => {
            this.prev();
            this.resetAutoPlay();
        });
        document.querySelector('.carousel-control-next').addEventListener('click', () => {
            this.next();
            this.resetAutoPlay();
        });

        let touchStartX = 0;
        let touchEndX = 0;
        const carouselEl = document.querySelector('.carousel');
        carouselEl.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        carouselEl.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, false);
    },

    handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) this.next();
            else this.prev();
            this.resetAutoPlay();
        }
    }
};