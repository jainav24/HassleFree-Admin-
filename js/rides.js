/**
 * Rides Management Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const isRidesPage = window.location.pathname.includes('rides.html');
    if (isRidesPage) {
        initRidesPage();
    }
});

function initRidesPage() {
    const ridesTableBody = document.getElementById('ridesTableBody');
    const createRequestBtn = document.getElementById('createRequestBtn');
    const requestForm = document.getElementById('requestForm');
    const searchRideInput = document.getElementById('searchRideInput');
    const filterRideStatus = document.getElementById('filterRideStatus');

    if (!ridesTableBody) return;

    renderRidesTable();

    // Filters
    searchRideInput?.addEventListener('input', (e) => {
        renderRidesTable(e.target.value, filterRideStatus.value);
    });

    filterRideStatus?.addEventListener('change', (e) => {
        renderRidesTable(searchRideInput.value, e.target.value);
    });

    createRequestBtn?.addEventListener('click', openCreateRequestModal);
    
    requestForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleRequestSubmit();
    });

    // Close buttons for Modals
    document.querySelectorAll('#createRequestModal .close-modal-btn, #cancelRequestBtn, #closeInvoiceModalBtn, #closeSimModalBtn').forEach(btn => {
        btn.addEventListener('click', window.closeAllModals);
    });

    initSimulationActions();
    initInvoiceActions();
}

function renderRidesTable(filterText = '', filterStatus = 'all') {
    const ridesTableBody = document.getElementById('ridesTableBody');
    if (!ridesTableBody) return;

    let rides = getRides();

    if (filterStatus !== 'all') {
        rides = rides.filter(r => r.status === filterStatus);
    }

    if (filterText) {
        const lowerText = filterText.toLowerCase();
        rides = rides.filter(r =>
            r.customer.toLowerCase().includes(lowerText) ||
            r.driver.toLowerCase().includes(lowerText) ||
            r.location.toLowerCase().includes(lowerText) ||
            r.id.toLowerCase().includes(lowerText)
        );
    }

    if (rides.length === 0) {
        ridesTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 2rem;">No rides found.</td></tr>';
        return;
    }

    ridesTableBody.innerHTML = rides.map(ride => `
        <tr>
            <td style="font-weight: 500;">${ride.id}</td>
            <td>${ride.customer}</td>
            <td>${ride.driver}</td>
            <td style="color: var(--text-muted); font-size: 0.85rem;">${ride.date}</td>
            <td style="font-weight: 600;">${ride.amount}</td>
            <td>${getStatusBadge(ride.status)}</td>
            <td>
                <div class="action-btns-container">
                    <button class="actions-btn generate-bill-btn" data-id="${ride.id}" title="Generate Bill" style="color:var(--primary-color);">
                        <i class="fa-solid fa-file-invoice"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.generate-bill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openGenerateInvoiceModal(e.currentTarget.getAttribute('data-id')));
    });
}


function openCreateRequestModal() {
    const modal = document.getElementById('createRequestModal');
    const form = document.getElementById('requestForm');
    const driverSelect = document.getElementById('reqDriverAssign');
    
    if (!modal) return;

    form.reset();
    
    // Populate drivers
    const drivers = getDrivers().filter(d => d.status === 'Verified' && d.isActive !== false);
    if (drivers.length === 0) {
        driverSelect.innerHTML = '<option value="">No Active Verified Drivers</option>';
    } else {
        driverSelect.innerHTML = drivers.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    }

    // Client Name Suggestions
    const clients = [...new Set(getRides().map(r => r.customer))];
    const clientInput = document.getElementById('reqClientName');
    if (clientInput) {
        clientInput.setAttribute('list', 'clientSuggestions');
        let dataList = document.getElementById('clientSuggestions');
        if (!dataList) {
            dataList = document.createElement('datalist');
            dataList.id = 'clientSuggestions';
            document.body.appendChild(dataList);
        }
        dataList.innerHTML = clients.map(c => `<option value="${c}">`).join('');
    }

    // Default bits
    const now = new Date();
    document.getElementById('reqDate').value = now.toISOString().split('T')[0];
    document.getElementById('reqDate').min = document.getElementById('reqDate').value;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function handleRequestSubmit() {
    const reqDateVal = document.getElementById('reqDate').value;
    const reqTimeVal = document.getElementById('reqTime').value;
    
    const requestDateTime = new Date(`${reqDateVal}T${reqTimeVal}`);
    const now = new Date();
    const diffHours = (requestDateTime - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
        alert('Service request must be at least 2 hours before the start time.');
        return;
    }

    const newRide = {
        customer: document.getElementById('reqClientName').value.trim(),
        driver: document.getElementById('reqDriverAssign').value,
        date: `${reqDateVal} ${reqTimeVal}`,
        amount: `₹${document.getElementById('reqAmount').value}`,
        location: document.getElementById('reqLocation').value.trim(),
        status: 'Pending'
    };

    const addedRide = addRide(newRide);
    window.currentPendingRideId = addedRide.id;

    window.closeAllModals();
    renderRidesTable();
    triggerDriverSimulation(addedRide);
}

function triggerDriverSimulation(ride) {
    const modal = document.getElementById('driverSimulationModal');
    if (!modal) return;

    document.getElementById('simDriverName').textContent = ride.driver;
    document.getElementById('simClient').textContent = ride.customer;
    document.getElementById('simDateTime').textContent = ride.date;
    document.getElementById('simLocation').textContent = ride.location;
    document.getElementById('simAmount').textContent = ride.amount;

    modal.classList.add('active');
}

function initSimulationActions() {
    const acceptBtn = document.getElementById('simAcceptBtn');
    const rejectBtn = document.getElementById('simRejectBtn');

    acceptBtn?.addEventListener('click', () => {
        const rides = getRides();
        const index = rides.findIndex(r => r.id === window.currentPendingRideId);
        if (index !== -1) {
            rides[index].status = 'Accepted';
            saveRides(rides);
            renderRidesTable();
        }
        window.closeAllModals();
        alert('Driver has ACCEPTED the request!');
    });

    rejectBtn?.addEventListener('click', () => {
        const rides = getRides();
        const ride = rides.find(r => r.id === window.currentPendingRideId);
        if (!ride) return;

        const otherDriver = getDrivers().filter(d => d.status === 'Verified').find(d => d.name !== ride.driver);

        if (otherDriver) {
            alert(`Driver ${ride.driver} rejected. Auto-reassigning to ${otherDriver.name}...`);
            ride.driver = otherDriver.name;
            ride.status = 'Reassigned';
            updateRide(ride);
            renderRidesTable();
            triggerDriverSimulation(ride);
        } else {
            alert(`No other verified drivers available.`);
            ride.status = 'Rejected';
            updateRide(ride);
            renderRidesTable();
            window.closeAllModals();
        }
    });
}

// Invoice Actions
function openGenerateInvoiceModal(rideId) {
    const modal = document.getElementById('generateInvoiceModal');
    const ride = getRides().find(r => r.id === rideId);
    if (!ride || !modal) return;

    document.getElementById('invClientName').textContent = ride.customer;
    document.getElementById('invRideDate').textContent = `Date: ${ride.date}`;
    document.getElementById('invNumber').textContent = `INV-${Math.floor(10000 + Math.random() * 90000)}`;

    calculateInvoice();
    modal.classList.add('active');
}

function calculateInvoice() {
    const distance = parseFloat(document.getElementById('invDistance').value) || 0;
    const rate = parseFloat(document.getElementById('invRate').value) || 0;
    const taxRate = parseFloat(document.getElementById('invTax').value) || 0;

    const subtotal = distance * rate;
    const taxVal = subtotal * (taxRate / 100);
    const total = subtotal + taxVal;

    document.getElementById('invSubtotal').textContent = subtotal.toFixed(2);
    document.getElementById('invTaxLabel').textContent = `Tax Amount (${taxRate}%):`;
    document.getElementById('invTaxAmount').textContent = taxVal.toFixed(2);
    document.getElementById('invTotalAmount').textContent = total.toFixed(2);
}

function initInvoiceActions() {
    ['invDistance', 'invRate', 'invTax'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calculateInvoice);
    });

    document.getElementById('printInvoiceBtn')?.addEventListener('click', () => window.print());
    
    document.getElementById('downloadInvoiceBtn')?.addEventListener('click', () => {
        const invNo = document.getElementById('invNumber').textContent;
        const text = `HASSLEFREE DRIVE INVOICE\nNo: ${invNo}\nTotal: ₹${document.getElementById('invTotalAmount').textContent}`;
        const blob = new Blob([text], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Invoice_${invNo}.txt`;
        link.click();
    });
}
