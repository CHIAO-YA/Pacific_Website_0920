// 簡單的互動功能
document.addEventListener('DOMContentLoaded', function () {
    // 樓層選項資料
    const floorOptions = {
        all: [
            { value: 'all', text: '- 所有樓層 -' }
        ],
        main: [
            { value: 'all', text: '- 所有樓層 -' },
            { value: '1f', text: '1F 奢華珠寶台' },
            { value: '2f', text: '2F 時髦衣櫃派' },
            { value: '3f', text: '3F 優雅美身力' },
            { value: '4f', text: '4F 型男愛運動' },
            { value: '5f', text: '5F 開心童樂園' },
            { value: '6f', text: '6F 富居好生活' },
            { value: 'b1f', text: 'B1F 生活美食家' },
            { value: 'b2f', text: 'B2F 停車場' },
            { value: 'sunny', text: '二館 Sunny Park' }
        ],
        pingtung: [
            { value: 'all', text: '- 所有樓層 -' },
            { value: 'pt1f-food', text: '屏東驛站商場 1F 饗食光' },
            { value: 'pt1f-fashion', text: '屏東驛站商場 1F 潮時尚' },
            { value: 'pt2f', text: '屏東驛站商場 2F 享生活' }
        ],
        chaozhou: [
            { value: 'all', text: '- 所有樓層 -' },
            { value: 'cz', text: '潮州驛站商場' }
        ]
    };

    // 獲取選單元素
    const buildingSelect = document.getElementById('building-select');
    const floorSelect = document.getElementById('floor-select');

    // 更新樓層選單
    function updateFloorOptions(building) {
        const options = floorOptions[building] || floorOptions.all;
        floorSelect.innerHTML = '';

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            floorSelect.appendChild(optionElement);
        });
    }

    // 監聽分館選擇變化
    buildingSelect.addEventListener('change', function () {
        updateFloorOptions(this.value);
    });

    // 初始化樓層選單
    updateFloorOptions('all');

    // 分類標籤切換
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 品牌卡片點擊效果
    const brandCards = document.querySelectorAll('.brand-card');
    brandCards.forEach(card => {
        card.addEventListener('click', function () {
            const brandName = this.querySelector('.brand-name').textContent;
            alert(`跳轉到 ${brandName} 品牌頁面`);
        });
    });

    // 搜尋功能
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        brandCards.forEach(card => {
            const brandName = card.querySelector('.brand-name').textContent.toLowerCase();
            if (brandName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
// 從URL或localStorage獲取品牌資料
const brandId = new URLSearchParams(window.location.search).get('id') || '4F_001';

// 載入品牌資料
async function loadBrandDetail() {
    try {
        const response = await fetch('/data/brands/all-brands.json');
        const data = await response.json();
        const brand = data.brands.find(b => b.id === brandId);

        if (brand) {
            updateBrandInfo(brand);
        } else {
            console.error('找不到品牌資料');
        }
    } catch (error) {
        console.error('載入品牌資料失敗:', error);
    }
}

// 更新頁面內容
function updateBrandInfo(brand) {
    document.title = `${brand.card_name} - 屏東太平洋百貨`;
    document.querySelector('.brand-title').textContent = brand.card_name;
    document.querySelector('.floor-value').textContent = brand.card_floor;
    document.querySelector('.info-value:last-child').textContent = brand.phone;
    document.querySelector('.description p').textContent = brand.description;
    document.querySelector('.brand-main-image').src = brand.cover_image;
    document.querySelector('.brand-main-image').alt = brand.card_name;
}

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', loadBrandDetail);