// js/main.js — 輕量、避免重複綁定、提早互動
document.addEventListener('DOMContentLoaded', () => {

  // 載入組件（並行）
  function loadComponent(id, url) {
    return fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(html => { const slot = document.getElementById(id); if (slot) slot.innerHTML = html; });
  }

  Promise.all([
    loadComponent('header-container',    'components/header.html'),
    loadComponent('carousel-container',  'components/carousel.html'),
    loadComponent('main-content-container','components/main-content.html'),
    loadComponent('products-container',  'components/products.html'),
    loadComponent('local-container',     'components/local.html'),
    loadComponent('events-container',    'components/events.html'),
    loadComponent('footer-container',    'components/footer.html')
  ])
  .then(() => {
    // === 初始化 Carousel（避免二次初始化） ===
    if (window.carousel && typeof carousel.init === 'function' && !carousel._inited) {
      // 你的 carousel.html 若已自行呼叫 init，可把這段拿掉
      try {
        carousel.init({ selector: '.carousel', interval: 5000 });
      } catch (e) {
        // 回退：無參數版本
        try { carousel.init(); } catch (_) {}
      }
      carousel._inited = true;
    }

    setupSmoothScroll();
    setupMobileMenu();

    // 登入蓋板（保留；報名蓋板交給 index.html 內的新腳本）
      setupLoginModal();
    //feature特色區塊 滑動出現動畫
      setupScrollAnimations();
     //feature特色區塊輪播
      setupFeaturesCarousel();
      // product蓋板
      setupProductModal();
      // 產品列表「顯示更多」按鈕
      setupProductShowMore();
      // 新增：最新消息分類篩選
      setupCategoryFilter();
  })
  .catch(err => console.error('Error loading components:', err));

  // ===== 功能：平滑捲動 =====
  function setupSmoothScroll() {
    const links = document.querySelectorAll('.scroll-link');
    if (!links.length) return;

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;
        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        const header = document.querySelector('header');
        const headerH = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerH;

        window.scrollTo({ top, behavior: 'smooth' });
      }, { passive: true });
    });
  }

  // ===== 功能：手機選單 =====
  function setupMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks   = document.querySelector('.nav-links');
    if (!mobileMenu || !navLinks) return;

    mobileMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open');
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 576) navLinks.classList.remove('open');
    }, { passive: true });
  }

  // ===== 功能：登入蓋板（與報名蓋板分開，避免邏輯衝突） =====
  function setupLoginModal() {
    const openBtn = document.querySelector('.login-btn');
    const modal   = document.getElementById('login-modal');
    if (!modal) return;
    const closeBtn = modal.querySelector('.close-btn');

    let lastFocus = null, scrollY = 0;

    const open = (e) => {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('modal-open');
      modal.setAttribute('aria-hidden', 'false');

      setTimeout(() => {
        const first = modal.querySelector('input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])');
        if (first) first.focus();
      }, 0);
    };

    const close = (e) => {
      if (e) e.preventDefault();
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
      try { lastFocus && lastFocus.focus(); } catch(_) {}
      const form = modal.querySelector('#login-form');
      if (form) form.reset();
    };

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) {
      closeBtn.setAttribute('role', 'button');
      closeBtn.setAttribute('tabindex', '0');
      closeBtn.addEventListener('click', close);
      closeBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') close(e);
      });
    }

    modal.addEventListener('click', (e) => { if (e.target === modal) close(e); });
    document.addEventListener('keydown', (e) => {
      const isOpen = modal.getAttribute('aria-hidden') === 'false';
      if (!isOpen) return;
      if (e.key === 'Escape') return close(e);

      if (e.key === 'Tab') {
        const nodes = Array.from(modal.querySelectorAll('a[href],button,textarea,input,select,[tabindex]:not([tabindex="-1"])'))
          .filter(el => !el.disabled && el.offsetParent !== null);
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
    // ===== 功能：feature特色區塊 滑動出現動畫 =====
    function setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    entry.target.classList.remove('visible');
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.fade-in-up').forEach(el => {
            observer.observe(el);
        });
    }


    // ===== 功能：feature特色區塊輪播 =====
    function setupFeaturesCarousel() {
        const carousel = document.querySelector('.features-carousel');
        if (!carousel) return;

        const grid = carousel.querySelector('.features-grid');
        const prevBtn = carousel.querySelector('.prev-btn');
        const nextBtn = carousel.querySelector('.next-btn');
        const cards = carousel.querySelectorAll('.feature-card');

        let currentPage = 0;

        function getCardsPerPage() {
            const screenWidth = window.innerWidth;
            if (screenWidth >= 1200) return 4;
            if (screenWidth >= 768) return 3;
            if (screenWidth >= 480) return 2;
            return 1;
        }

        function updateCarousel() {
            const cardsPerPage = getCardsPerPage();
            const totalPages = Math.ceil(cards.length / cardsPerPage);

            cards.forEach((card, index) => {
                const startIndex = currentPage * cardsPerPage;
                const endIndex = startIndex + cardsPerPage;

                if (index >= startIndex && index < endIndex) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });

            prevBtn.disabled = currentPage === 0;
            nextBtn.disabled = currentPage >= totalPages - 1;
        }

        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                updateCarousel();
            }
        });

        nextBtn.addEventListener('click', () => {
            const cardsPerPage = getCardsPerPage();
            const totalPages = Math.ceil(cards.length / cardsPerPage);
            if (currentPage < totalPages - 1) {
                currentPage++;
                updateCarousel();
            }
        });

        updateCarousel();

        window.addEventListener('resize', () => {
            updateCarousel();
        });
    }

    // ===== 功能：product蓋板 =====
    function setupProductModal() {
        const modal = document.getElementById('product-modal');
        if (!modal) return;

        const closeBtn = modal.querySelector('.close-btn');

        // 點擊查看更多按鈕
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('product-detail-btn')) {
                e.preventDefault();
                modal.style.display = 'block';
            }
        });

        // 點擊關閉按鈕
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                modal.style.display = 'none';
            });
        }

        // 點擊背景關閉
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // ===== 功能：產品列表「顯示更多」按鈕 =====
    function setupProductShowMore() {
        const showMoreBtn = document.querySelector('#show-more-btn');
        const allProducts = document.querySelectorAll('.product-card');
        let isExpanded = false;

        if (!showMoreBtn) return;

        // 初始化：隱藏第10個商品之後的所有商品
        allProducts.forEach((product, index) => {
            if (index >= 10) {
                product.classList.add('product-hidden');
            }
        });

        showMoreBtn.addEventListener('click', function (e) {
            e.preventDefault(); // 防止 <a> 標籤的預設跳轉行為
            e.stopPropagation(); // 停止事件冒泡

            if (!isExpanded) {
                // 展開：顯示隱藏的商品
                allProducts.forEach((product, index) => {
                    if (index >= 10) {
                        product.classList.remove('product-hidden');
                    }
                });
                showMoreBtn.textContent = '隱藏部分商品';
                isExpanded = true;
            } else {
                // 收合：隱藏後面的商品
                allProducts.forEach((product, index) => {
                    if (index >= 10) {
                        product.classList.add('product-hidden');
                    }
                });
                showMoreBtn.textContent = '查看更多商品';
                isExpanded = false;
                // 收合後滾動到按鈕位置
                showMoreBtn.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    }
    // ===== 功能：最新消息分類篩選 =====
    function setupCategoryFilter() {
        const categoryLinks = document.querySelectorAll('.nav-sidebar a');
        const allCards = document.querySelectorAll('.local-feature');

        if (!categoryLinks.length || !allCards.length) return;

        function filterCards(category) {
            console.log('篩選分類:', category);

            allCards.forEach((card, index) => {
                const cardCategory = card.getAttribute('data-category');

                if (cardCategory === category) {  // 只有這個條件
                    card.style.setProperty('display', 'flex', 'important');
                    card.style.setProperty('opacity', '1', 'important');
                    card.style.setProperty('visibility', 'visible', 'important');
                    console.log(`顯示: ${cardCategory}`);
                } else {
                    card.style.setProperty('display', 'none', 'important');
                    card.style.setProperty('opacity', '0', 'important');
                    card.style.setProperty('visibility', 'hidden', 'important');
                    console.log(`隱藏: ${cardCategory}`);
                }
            });
        }

        // 初始化：顯示活動快報
        filterCards('活動快報');

        // 綁定分類連結事件
        categoryLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                categoryLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                const selectedCategory = this.getAttribute('data-category');
                filterCards(selectedCategory);
            });
        });
    }
});
