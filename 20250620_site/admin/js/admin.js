// 模擬活動數據（應由後端提供）
let activities = [
    {
        id: 'ACT-20250316-001',
        title: '春季花卉展覽',
        date: '2025-03-20',
        time: '10:00',
        content: '歡迎參加屏東風情百貨的春季花卉展覽，探索各種美麗的花卉！',
        startDate: '2025-03-16T00:00',
        endDate: '2025-03-25T23:59',
        registrations: 120
    },
    {
        id: 'ACT-20250316-002',
        title: '親子烘焙工作坊',
        date: '2025-04-01',
        time: '14:00',
        content: '帶著孩子一起來參加烘焙工作坊，製作美味的甜點！',
        startDate: '2025-03-20T00:00',
        endDate: '2025-04-05T23:59',
        registrations: 45
    }
];

// 當前頁面
let currentPage = 1;
const itemsPerPage = 5;

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    renderActivities();
    document.getElementById('filter-form').addEventListener('submit', filterActivities);
});

// 渲染活動列表
function renderActivities(filteredActivities = activities) {
    const tbody = document.getElementById('activity-table-body');
    tbody.innerHTML = '';

    const now = new Date();
    filteredActivities.forEach(activity => {
        const start = new Date(activity.startDate);
        const end = new Date(activity.endDate);
        const activityDate = new Date(activity.date + 'T' + activity.time);

        let status = 'ongoing';
        let statusText = '進行中';
        if (now < start) {
            status = 'not-started';
            statusText = '尚未開始';
        } else if (now > end) {
            status = 'ended';
            statusText = '已結束';
        }

        // 模擬官網上下架邏輯
        activity.isPublished = now >= start && now <= end;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${activity.id}</td>
            <td>${activity.title}</td>
            <td>${activity.date}</td>
            <td>${activity.time}</td>
            <td>${activity.registrations}</td>
            <td><span class="status-badge ${status}">${statusText}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon view" title="查看詳情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit" title="編輯活動" onclick="editActivity('${activity.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" title="刪除活動" onclick="deleteActivity('${activity.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 篩選活動
function filterActivities(e) {
    e.preventDefault();
    const status = document.getElementById('filter-status').value;
    const dateStart = document.getElementById('filter-date-start').value;
    const dateEnd = document.getElementById('filter-date-end').value;

    let filteredActivities = activities;

    if (status) {
        const now = new Date();
        filteredActivities = filteredActivities.filter(activity => {
            const start = new Date(activity.startDate);
            const end = new Date(activity.endDate);
            if (status === 'ongoing') return now >= start && now <= end;
            if (status === 'not-started') return now < start;
            if (status === 'ended') return now > end;
            return true;
        });
    }

    if (dateStart) {
        filteredActivities = filteredActivities.filter(activity => new Date(activity.date) >= new Date(dateStart));
    }

    if (dateEnd) {
        filteredActivities = filteredActivities.filter(activity => new Date(activity.date) <= new Date(dateEnd));
    }

    renderActivities(filteredActivities);
}

// 打開活動模態框
function openActivityModal(mode, activity = null) {
    const modal = document.getElementById('activity-modal');
    const form = document.getElementById('activity-form');
    const title = document.getElementById('modal-title');

    if (mode === 'add') {
        title.textContent = '新增活動';
        form.reset();
        document.getElementById('activity-id').value = '';
    } else if (mode === 'edit' && activity) {
        title.textContent = '編輯活動';
        document.getElementById('activity-id').value = activity.id;
        document.getElementById('activity-title').value = activity.title;
        document.getElementById('activity-date').value = activity.date;
        document.getElementById('activity-time').value = activity.time;
        document.getElementById('activity-content').value = activity.content;
        document.getElementById('activity-start-date').value = activity.startDate.replace(' ', 'T');
        document.getElementById('activity-end-date').value = activity.endDate.replace(' ', 'T');
    }

    modal.style.display = 'flex';
}

// 關閉活動模態框
function closeActivityModal() {
    const modal = document.getElementById('activity-modal');
    modal.style.display = 'none';
    document.getElementById('activity-form').reset();
}

// 編輯活動
function editActivity(id) {
    const activity = activities.find(a => a.id === id);
    if (activity) {
        openActivityModal('edit', activity);
    }
}

// 刪除活動
function deleteActivity(id) {
    if (confirm('確定要刪除此活動？')) {
        activities = activities.filter(a => a.id !== id);
        renderActivities();
    }
}

// 提交活動表單
document.getElementById('activity-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('activity-id').value || `ACT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(activities.length + 1).padStart(3, '0')}`;
    const title = document.getElementById('activity-title').value;
    const date = document.getElementById('activity-date').value;
    const time = document.getElementById('activity-time').value;
    const content = document.getElementById('activity-content').value;
    const startDate = document.getElementById('activity-start-date').value.replace('T', ' ');
    const endDate = document.getElementById('activity-end-date').value.replace('T', ' ');

    const activity = {
        id,
        title,
        date,
        time,
        content,
        startDate,
        endDate,
        registrations: activities.find(a => a.id === id)?.registrations || 0
    };

    const index = activities.findIndex(a => a.id === id);
    if (index !== -1) {
        activities[index] = activity;
    } else {
        activities.push(activity);
    }

    renderActivities();
    closeActivityModal();
});

// 模擬分頁（此處簡化處理）
function changePage(direction) {
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    renderActivities();
}

// 模擬官網數據同步（應由後端實現）
function syncWithWebsite() {
    const publishedActivities = activities.filter(a => a.isPublished);
    console.log('同步到官網的活動:', publishedActivities);
    // 假設有一個 API 端點用於同步：fetch('/api/sync-activities', { method: 'POST', body: JSON.stringify(publishedActivities) });
}

// 定期檢查活動狀態並同步
setInterval(() => {
    renderActivities();
    syncWithWebsite();
}, 60000); // 每分鐘檢查一次