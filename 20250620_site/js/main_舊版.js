// js/main.js

window.addEventListener('load', () => {
    // 載入組件函數
    function loadComponent(id, url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                document.getElementById(id).innerHTML = data;
                return id; // 返回 ID 以便後續處理
            })
            .catch(error => console.error(`Failed to load ${url}:`, error));
    }

    // 依序載入所有組件
    Promise.all([
        loadComponent('header-container', 'components/header.html'),
        loadComponent('carousel-container', 'components/carousel.html'),
        loadComponent('main-content-container', 'components/main-content.html'),
        loadComponent('products-container', 'components/products.html'),
        loadComponent('local-container', 'components/local.html'),
        loadComponent('events-container', 'components/events.html'),
        loadComponent('footer-container', 'components/footer.html')
    ]).then(() => {
        // 初始化 carousel（依賴 carousel.js）
        if (typeof carousel !== 'undefined' && typeof carousel.init === 'function') {
            carousel.init();
        } else {
            console.error('Carousel is not defined or init is not a function');
        }

        // 設置平滑滾動效果
        setupSmoothScroll();

        // 漢堡選單點擊事件
        const mobileMenu = document.querySelector('.mobile-menu');
        const navLinks = document.querySelector('.nav-links');

        if (mobileMenu && navLinks) {
            mobileMenu.addEventListener('click', (event) => {
                // 阻止事件冒泡，避免觸發 document 的點擊事件
                event.stopPropagation();
                // 切換選單的展開/收合狀態
                if (navLinks.classList.contains('open')) {
                    navLinks.classList.remove('open');
                } else {
                    navLinks.classList.add('open');
                }
            });

            // 點擊頁面任意處（包括選單內部）收合選單
            document.addEventListener('click', (event) => {
                // 如果選單處於展開狀態，且點擊的不是漢堡選單本身，則收合選單
                if (navLinks.classList.contains('open')) {
                    navLinks.classList.remove('open');
                }
            });

            // 點擊選單內部時也收合選單（確保事件冒泡到 document）
            navLinks.addEventListener('click', (event) => {
                // 允許事件冒泡，觸發 document 的點擊事件，從而收合選單
                // 如果點擊的是連結，確保連結的預設行為（例如跳轉）正常執行
            });

            // 確保在螢幕大小改變時，導航欄的顯示狀態正確
            window.addEventListener('resize', () => {
                if (window.innerWidth > 576) {
                    navLinks.classList.remove('open'); // 大螢幕時移除展開狀態
                    navLinks.style.height = ''; // 清除高度樣式
                    navLinks.style.opacity = ''; // 清除透明度樣式
                }
            });
        } else {
            console.warn('Mobile menu or nav links not found');
        }

        // 點擊「登入」按鈕顯示 popup
        const loginButton = document.querySelector('.login-btn');
        if (loginButton) {
            loginButton.addEventListener('click', (event) => {
                event.stopPropagation(); // 阻止事件冒泡，避免觸發 document 的點擊事件
                showLoginForm();
            });
        }

        // 確保 events-container 載入後再綁定事件
        const bindEvents = () => {
            // 動態綁定「立即報名」按鈕的事件監聽器
            const registerButtons = document.querySelectorAll('.register-btn');
            if (registerButtons.length > 0) {
                registerButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const eventTitle = button.getAttribute('data-event');
                        showRegistrationForm(eventTitle);
                        console.log('Button clicked:', eventTitle); // 調試用
                    });
                });
            } else {
                console.warn('No register buttons found');
            }

            // 綁定關閉按鈕事件（報名表單）
            const closeButton = document.querySelector('#registration-modal .close-btn');
            if (closeButton) {
                closeButton.addEventListener('click', closeRegistrationForm);
            } else {
                console.warn('Close button for registration modal not found');
            }

            // 綁定關閉按鈕事件（登入表單）
            const loginCloseButton = document.querySelector('#login-modal .close-btn');
            if (loginCloseButton) {
                loginCloseButton.addEventListener('click', closeLoginForm);
            } else {
                console.warn('Close button for login modal not found');
            }
        };

        // 延遲執行事件綁定，確保 DOM 更新
        setTimeout(bindEvents, 100); // 100ms 延遲，確保 DOM 準備好

        // 報名表單控制函數
        function showRegistrationForm(eventTitle) {
            const modal = document.getElementById('registration-modal');
            if (modal) {
                const eventTitleElement = document.getElementById('modal-event-title');
                eventTitleElement.textContent = `${eventTitle}-報名表`;
                modal.style.display = 'block';
                console.log('Modal shown for:', eventTitle); // 調試用
            }
        }

        function closeRegistrationForm() {
            const modal = document.getElementById('registration-modal');
            if (modal) {
                modal.style.display = 'none';
                document.getElementById('registration-form')?.reset(); // 清空表單
                console.log('Modal closed'); // 調試用
            }
        }

        // 登入表單控制函數
        function showLoginForm() {
            const modal = document.getElementById('login-modal');
            if (modal) {
                modal.style.display = 'block';
                console.log('Login modal shown'); // 調試用
            }
        }

        function closeLoginForm() {
            const modal = document.getElementById('login-modal');
            if (modal) {
                modal.style.display = 'none';
                document.getElementById('login-form')?.reset(); // 清空表單
                console.log('Login modal closed'); // 調試用
            }
        }

        // 點擊表單外部關閉（同時處理報名表單和登入表單）
        window.onclick = function(event) {
            const registrationModal = document.getElementById('registration-modal');
            const loginModal = document.getElementById('login-modal');
            if (registrationModal && event.target === registrationModal) {
                closeRegistrationForm();
            }
            if (loginModal && event.target === loginModal) {
                closeLoginForm();
            }
        };

        // 表單提交處理（報名表單）
        const registrationForm = document.getElementById('registration-form');
        if (registrationForm) {
            registrationForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const formData = {
                    eventTitle: document.getElementById('modal-event-title').textContent,
                    name: document.getElementById('name').value,
                    phone: document.getElementById('phone').value,
                    gender: document.getElementById('gender').value,
                    birthdate: document.getElementById('birthdate').value
                };
                console.log('提交數據:', formData); // 模擬提交到後端
                alert('感謝您的報名！數據已提交（模擬）。');
                closeRegistrationForm();
            });
        }

        // 表單提交處理（登入表單，模擬）
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const formData = {
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                };
                console.log('登入數據:', formData); // 模擬提交到後端
                alert('登入成功！（模擬）');
                closeLoginForm();
            });
        }
    }).catch(error => {
        console.error('Error loading components:', error);
    });
    
    // 設置平滑滾動功能
    function setupSmoothScroll() {
        const scrollLinks = document.querySelectorAll('.scroll-link');
        scrollLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // 計算滾動位置，考慮固定標題的高度（如果有）
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    // 使用平滑滾動
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
});