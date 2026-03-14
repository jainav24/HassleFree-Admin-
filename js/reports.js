/**
 * Reports & Analytics Logic
 */

let reportsRevenueChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    const isReportsPage = window.location.pathname.includes('reports.html');
    if (isReportsPage) {
        initReportsPage();
    }
});

function initReportsPage() {
    renderSalesReport();
    renderDriverDatabaseReport();
    renderReportsRevenueChart();

    const reportSearchInput = document.getElementById('reportSearchDriverInput');
    const reportFilterStatus = document.getElementById('reportFilterDriverStatus');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    reportSearchInput?.addEventListener('input', renderDriverDatabaseReport);
    reportFilterStatus?.addEventListener('change', renderDriverDatabaseReport);

    exportCsvBtn?.addEventListener('click', handleExportCSV);
}

function renderSalesReport() {
    const salesTbody = document.getElementById('salesReportTableBody');
    if (!salesTbody) return;

    const rides = getRides();
    const drivers = getDrivers();
    const driverStats = {};

    drivers.forEach(d => {
        driverStats[d.name] = { id: d.id, sales: 0, trips: 0 };
    });

    rides.forEach(r => {
        if (['Completed', 'Accepted', 'In Progress'].includes(r.status) && r.driver && driverStats[r.driver]) {
            driverStats[r.driver].trips += 1;
            const amt = parseInt(r.amount.replace(/[^0-9.-]+/g, "")) || 0;
            driverStats[r.driver].sales += amt;
        }
    });

    const sortedDrivers = Object.values(driverStats).sort((a, b) => b.sales - a.sales);

    salesTbody.innerHTML = sortedDrivers.map(d => `
        <tr>
            <td style="font-weight: 500;">${d.id}</td>
            <td>${Object.keys(driverStats).find(name => driverStats[name].id === d.id)}</td>
            <td style="font-weight: 600; color:var(--primary-color);">₹${d.sales.toLocaleString('en-IN')}</td>
            <td>${d.trips}</td>
        </tr>
    `).join('');
}

function renderDriverDatabaseReport() {
    const tBody = document.getElementById('driverReportTableBody');
    if (!tBody) return;

    let drivers = getDrivers();
    const searchTerm = document.getElementById('reportSearchDriverInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('reportFilterDriverStatus')?.value || 'all';

    if (statusFilter !== 'all') {
        drivers = drivers.filter(d => d.status === statusFilter);
    }
    if (searchTerm) {
        drivers = drivers.filter(d =>
            d.name.toLowerCase().includes(searchTerm) ||
            d.phone.includes(searchTerm) ||
            d.id.toLowerCase().includes(searchTerm)
        );
    }

    tBody.innerHTML = drivers.map(d => `
        <tr>
            <td style="font-weight: 500;">${d.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=random" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%;">
                    <div>
                        <div style="font-weight: 500;">${d.name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${d.phone}</div>
                    </div>
                </div>
            </td>
            <td>${d.experience}</td>
            <td>${d.license}</td>
            <td>${getStatusBadge(d.status)}</td>
        </tr>
    `).join('');
}

function handleExportCSV() {
    const drivers = getDrivers();
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Driver ID,Driver Name,Phone,Experience,License No,Status\n";

    drivers.forEach(d => {
        const row = [d.id, d.name, d.phone, d.experience, d.license, d.status].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "driver_report.csv";
    link.click();
}

function renderReportsRevenueChart() {
    const ctx = document.getElementById('reportsRevenueChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const rides = getRides();
    let currentMonthRevenue = 0;
    let revenueByDate = {};

    rides.forEach(r => {
        if (r.status === 'Completed') {
            const dateStr = r.date.split(' ')[0];
            const amt = parseInt(r.amount.replace(/[^0-9.-]+/g, "")) || 0;
            revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + amt;
            currentMonthRevenue += amt;
        }
    });

    const summaryEl = document.getElementById('revenueReportSummary');
    if (summaryEl) {
        summaryEl.innerHTML = `
            <div style="font-size:1.5rem; font-weight:700; color:var(--text-dark);">₹${currentMonthRevenue.toLocaleString('en-IN')}</div>
            <div style="font-size:0.85rem; color: var(--success); font-weight:500;">
                <i class="fa-solid fa-arrow-trend-up"></i> 15% vs last month (Mock)
            </div>
        `;
    }

    const revLabels = Object.keys(revenueByDate).sort().slice(-14);
    const revData = revLabels.map(d => revenueByDate[d]);

    if (reportsRevenueChartInstance) reportsRevenueChartInstance.destroy();
    reportsRevenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: revLabels.length ? revLabels : ['No Data'],
            datasets: [{
                label: 'Daily Revenue (₹)',
                data: revData.length ? revData : [0],
                backgroundColor: '#0F9D58',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { callback: (v) => '₹' + v } }
            }
        }
    });
}

