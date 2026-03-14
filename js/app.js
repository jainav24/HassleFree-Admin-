/**
 * Main Entry Point: HassleFreeDrive Admin Panel
 * Initializes page-specific logic and shared components.
 */

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Check if we're on the dashboard (index.html or /)
    if (path.includes('index.html') || path.endsWith('/') || path.endsWith('Dashboard')) {
        initDashboard();
    }
});

function initDashboard() {
    renderDashboardStats();
    renderRecentRequests();
    renderRecentApprovals();
    renderChart();
    renderUsersDriversTable();
}

/** Dashboard Specific Renderers (Moved from app.js) **/

function renderDashboardStats() {
    const dashboardStats = document.getElementById('dashboardStats');
    if (!dashboardStats) return;

    const drivers = getDrivers();
    const rides = getRides();
    const stats = getStats();

    const totalDrivers = drivers.length;
    const verifiedDrivers = drivers.filter(d => d.status === 'Verified').length;
    const pendingVerificationsCount = drivers.filter(d => ['Registration Received', 'Police Verification', 'Background Check'].includes(d.status)).length;

    const statsHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(74, 158, 255, 0.1); color: #4a9eff;">
                <i class="fa-solid fa-users"></i>
            </div>
            <div class="stat-content">
                <h3>${totalDrivers}</h3>
                <p>Total Drivers</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(156, 39, 176, 0.1); color: #9c27b0;">
                <i class="fa-solid fa-id-card"></i>
            </div>
            <div class="stat-content">
                <h3>${pendingVerificationsCount}</h3>
                <p>Pending Verifications</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(15, 157, 88, 0.1); color: #0F9D58;">
                <i class="fa-solid fa-car-on"></i>
            </div>
            <div class="stat-content">
                <h3>${verifiedDrivers}</h3>
                <p>Verified Drivers</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(255, 152, 0, 0.1); color: #ff9800;">
                <i class="fa-solid fa-indian-rupee-sign"></i>
            </div>
            <div class="stat-content">
                <h3>₹${stats.monthlyRevenue.toLocaleString('en-IN')}</h3>
                <p>Monthly Revenue</p>
            </div>
        </div>
    `;
    dashboardStats.innerHTML = statsHTML;
}

function renderRecentRequests() {
    const list = document.getElementById('recentRequestsList');
    if (!list) return;
    const rides = getRides().reverse().slice(0, 5);
    list.innerHTML = rides.map(ride => `
        <div class="activity-item">
            <div class="activity-avatar" style="background:#e0f2fe; color:#0284c7;"><i class="fa-solid fa-car"></i></div>
            <div class="activity-info">
                <p>${ride.customer}</p>
                <span>${ride.date} • Driver: ${ride.driver || 'Unassigned'}</span>
            </div>
            <div class="activity-amount">${getStatusBadge(ride.status)}</div>
        </div>
    `).join('');
}

function renderRecentApprovals() {
    const list = document.getElementById('recentApprovalsList');
    if (!list) return;
    const approvals = getDrivers().filter(d => d.status === 'Verified').reverse().slice(0, 5);
    list.innerHTML = approvals.map(d => `
        <div class="activity-item">
            <div class="activity-avatar" style="background:#dcfce7; color:#16a34a;"><i class="fa-solid fa-check"></i></div>
            <div class="activity-info">
                <p>${d.name}</p>
                <span>${d.experience} • ${d.license}</span>
            </div>
            <div class="activity-amount"><span class="badge badge-success">Verified</span></div>
        </div>
    `).join('');
}

let revenueChartInstance = null;
function renderChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const rides = getRides();
    let revenueByDate = {};
    rides.forEach(r => {
        if (r.status === 'Completed') {
            const date = r.date.split(' ')[0];
            const amt = parseInt(r.amount.replace(/[^0-9.-]+/g, "")) || 0;
            revenueByDate[date] = (revenueByDate[date] || 0) + amt;
        }
    });

    const labels = Object.keys(revenueByDate).sort().slice(-7);
    const data = labels.map(d => revenueByDate[d]);

    if (revenueChartInstance) revenueChartInstance.destroy();
    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length ? labels : ['No Data'],
            datasets: [{
                label: 'Revenue (₹)',
                data: data.length ? data : [0],
                borderColor: '#0F9D58',
                backgroundColor: 'rgba(15, 157, 88, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

function renderUsersDriversTable() {
    const tbody = document.getElementById('usersDriversTableBody');
    if (!tbody) return;

    // Use data from data.js
    const drivers = getDrivers();
    const colors = ['#b2a496', '#d1e6c3', '#e0f2fe', '#fbcfe8'];

    tbody.innerHTML = drivers.map((user, index) => {
        const initials = user.name.split(' ').map(n => n[0]).join('');
        const color = colors[index % colors.length];
        const joinDate = user.joinDate || '15 Jan 2023';
        const gender = user.gender || (index % 2 === 0 ? 'Male' : 'Female');
        const isActive = user.isActive !== false; // Default to true if undefined
        
        return `
            <tr>
                <td>
                    <div class="driver-info-cell">
                        <div class="avatar-initials" style="background-color: ${color}; color: #334155;">${initials}</div>
                        <span style="font-weight: 500; font-size: 0.95rem; color: #1e293b;">${user.name}</span>
                    </div>
                </td>
                <td style="color: #64748b; font-size: 0.9rem;">${joinDate}</td>
                <td style="color: #64748b; font-size: 0.9rem;">${gender}</td>
                <td><span class="role-badge driver">Driver</span></td>
                <td class="toggle-cell" style="text-align: right;">
                    <label class="toggle-switch">
                        <input type="checkbox" class="driver-activity-toggle" data-id="${user.id}" ${isActive ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </td>
            </tr>
        `;
    }).join('');

    // Attach toggle listeners
    document.querySelectorAll('.driver-activity-toggle').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            const isActive = e.target.checked;
            updateDriverActivity(id, isActive);
            // Optionally refresh stats if it affects anything visible
            renderDashboardStats();
        });
    });
}