/* /js/carousel.js
 * - 支援影片/圖片輪播
 * - 懶載入：使用 <source data-src="..."> 與 <img data-src="...">
 * - 自動播放：可設定是否尊重 prefers-reduced-motion
 * - 僅維護一個 carousel（以 selector 指到容器）
 */

(function () {
  const carousel = {
    // 狀態
    container: null,
    inner: null,
    slides: [],
    indicators: [],
    current: 0,
    timer: null,
    isAnimating: false,

    // 參數
    selector: '.carousel',
    interval: 5000,
    respectReducedMotion: true,

    init(opts = {}) {
      this.selector = opts.selector || this.selector;
      this.interval = typeof opts.interval === 'number' ? opts.interval : this.interval;
      this.respectReducedMotion = (opts.respectReducedMotion !== false);

      this.container = document.querySelector(this.selector);
      if (!this.container) return;

      this.inner = this.container.querySelector('.carousel-inner') || this.container;
      this.slides = Array.from(this.inner.querySelectorAll('.carousel-item'));
      if (!this.slides.length) return;

      // 若尚未有 active，就預設第 0 張為 active
      if (!this.slides.some(s => s.classList.contains('active'))) {
        this.slides[0].classList.add('active');
      }
      this.current = this.slides.findIndex(s => s.classList.contains('active'));
      if (this.current < 0) this.current = 0;

      // 指示器（可選）
      this.indicators = Array.from(this.container.querySelectorAll('.carousel-indicators [side]'));
      this.indicators.forEach((btn) => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('side'), 10);
          if (!Number.isNaN(idx)) this.go(idx);
        });
      });

      // 控制鈕（盡量相容多種命名）
      const prevBtn = this.container.querySelector('[data-action="prev"], .carousel-prev, .carousel-control.prev, .prev');
      const nextBtn = this.container.querySelector('[data-action="next"], .carousel-next, .carousel-control.next, .next');

      if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
      if (nextBtn) nextBtn.addEventListener('click', () => this.next());

      // 滑鼠移入暫停、移出恢復（行動裝置無效但不影響）
      this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
      this.container.addEventListener('mouseleave', () => this.startAutoPlay());

      // 能見度切換：離開分頁時暫停，回來時恢復
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.stopAutoPlay();
        else this.startAutoPlay();
      });

      // 第一次更新：先載入第 0/1 張來源
      this.update(this.current, { firstLoad: true });

      // 啟動自動播放
      this.startAutoPlay();
    },

    startAutoPlay() {
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce && this.respectReducedMotion) return; // 尊重使用者偏好：不自動播

      this.stopAutoPlay();
      this.timer = setInterval(() => this.next(), this.interval);
    },

    stopAutoPlay() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    prev() {
      if (this.isAnimating || !this.slides.length) return;
      this.go((this.current - 1 + this.slides.length) % this.slides.length);
    },

    next() {
      if (this.isAnimating || !this.slides.length) return;
      this.go((this.current + 1) % this.slides.length);
    },

    go(index) {
      if (index === this.current || index < 0 || index >= this.slides.length) return;
      this.update(index);
    },

    update(index, { firstLoad = false } = {}) {
      this.isAnimating = true;

      // 懶載入：預先處理 index 與下一張
      this.lazyAttachSources(index);

      // 切換 active
      const prev = this.slides[this.current];
      const next = this.slides[index];

      if (prev) {
        prev.classList.remove('active');
        prev.setAttribute('aria-hidden', 'true');
      }
      if (next) {
        next.classList.add('active');
        next.removeAttribute('aria-hidden');
      }

      // 指示器同步
      if (this.indicators.length) {
        this.indicators.forEach((btn, i) => {
          btn.classList.toggle('active', i === index);
          btn.setAttribute('aria-current', i === index ? 'true' : 'false');
        });
      }

      // 控制影片播放/暫停
      this.slides.forEach((slide, i) => {
        const v = slide.querySelector('video');
        if (!v) return;

        // 讓 iOS/Safari 也能自動播放
        v.muted = true; v.setAttribute('muted', '');
        v.playsInline = true; v.setAttribute('playsinline', '');

        if (i === index) {
          // 嘗試播放（有些瀏覽器需 catch）
          const p = v.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } else {
          v.pause();
          // 重播從頭（避免回來時接續中段）
          try { v.currentTime = 0; } catch (e) {}
        }
      });

      this.current = index;

      // 動畫結束保險（若用 CSS transition，可視需求調整時間）
      setTimeout(() => { this.isAnimating = false; }, firstLoad ? 0 : 300);
    },

    lazyAttachSources(index) {
      // 預載當前與下一張
      [index, (index + 1) % this.slides.length].forEach((i) => {
        const slide = this.slides[i];
        if (!slide) return;

        // 影片 <source data-src> -> src
        const vid = slide.querySelector('video');
        if (vid) {
          vid.muted = true; vid.setAttribute('muted', '');
          vid.playsInline = true; vid.setAttribute('playsinline', '');

          const sources = vid.querySelectorAll('source[data-src]');
          let attached = false;
          sources.forEach((s) => {
            if (!s.getAttribute('src')) {
              s.setAttribute('src', s.getAttribute('data-src'));
              s.removeAttribute('data-src');
              attached = true;
            }
          });
          if (attached) vid.load();
        }

        // 圖片 <img data-src> -> src
        const img = slide.querySelector('img[data-src]');
        if (img && !img.getAttribute('src')) {
          img.setAttribute('src', img.getAttribute('data-src'));
          img.removeAttribute('data-src');
        }
      });
    }
  };

  // 對外暴露
    window.carousel = carousel;

})();

