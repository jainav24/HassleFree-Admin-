/**
 * Drivers Management Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Only run if we are on the drivers page or dashboard (for dashboard stats/recent)
    const isDriversPage = window.location.pathname.includes('drivers.html');
    const isDashboard = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');

    if (isDriversPage) {
        initDriversPage();
    }
});

function initDriversPage() {
    const driversTableBody = document.getElementById('driversTableBody');
    const addDriverBtn = document.getElementById('addDriverBtn');
    const driverForm = document.getElementById('driverForm');
    const searchDriverInput = document.getElementById('searchDriverInput');
    const filterDriverStatus = document.getElementById('filterDriverStatus');

    if (!driversTableBody) return;

    renderDriversTable();

    // Filters
    searchDriverInput?.addEventListener('input', (e) => {
        renderDriversTable(e.target.value, filterDriverStatus.value);
    });

    filterDriverStatus?.addEventListener('change', (e) => {
        renderDriversTable(searchDriverInput.value, e.target.value);
    });

    // Add Driver Modal
    addDriverBtn?.addEventListener('click', () => openDriverModal());

    // Form Submit
    driverForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleDriverSubmit();
    });

    // Close buttons for Driver Modal
    document.querySelectorAll('#driverModal .close-modal-btn, #cancelModalBtn').forEach(btn => {
        btn.addEventListener('click', () => document.getElementById('driverModal').classList.remove('active'));
    });
}

function renderDriversTable(filterText = '', filterStatus = 'all') {
    const driversTableBody = document.getElementById('driversTableBody');
    if (!driversTableBody) return;

    let drivers = getDrivers();

    if (filterStatus !== 'all') {
        drivers = drivers.filter(d => d.status === filterStatus);
    }
    if (filterText) {
        const lowerText = filterText.toLowerCase();
        drivers = drivers.filter(d =>
            d.name.toLowerCase().includes(lowerText) ||
            d.id.toLowerCase().includes(lowerText) ||
            (d.vehicle && d.vehicle.toLowerCase().includes(lowerText))
        );
    }

    if (drivers.length === 0) {
        driversTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 2rem;">No drivers found.</td></tr>';
        return;
    }

    driversTableBody.innerHTML = drivers.map(driver => {
        const initials = driver.name.split(' ').map(n => n[0]).join('');
        return `
            <tr>
                <td>
                    <div class="driver-info-cell">
                        <div class="avatar-initials" style="background-color: #f1f5fa; color: #4b5563;">${initials}</div>
                        <div>
                            <span style="font-weight: 500; color: #1e293b;">${driver.name}</span>
                            <span class="email">${driver.id}</span>
                        </div>
                    </div>
                </td>
                <td>${driver.phone}</td>
                <td>${driver.experience}</td>
                <td>${driver.license}</td>
                <td>${getStatusBadge(driver.status)}</td>
                <td>
                    <div class="action-btns-container">
                        <button class="actions-btn view-driver-btn" data-id="${driver.id}" title="View & Process"><i class="fa-solid fa-eye"></i></button>
                        <button class="actions-btn edit-driver-btn" data-id="${driver.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="actions-btn delete delete-driver-btn" data-id="${driver.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    attachDriverActionListeners();
}

function attachDriverActionListeners() {
    document.querySelectorAll('.view-driver-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openViewDriverModal(e.currentTarget.getAttribute('data-id')));
    });

    document.querySelectorAll('.edit-driver-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openDriverModal(e.currentTarget.getAttribute('data-id')));
    });

    document.querySelectorAll('.delete-driver-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this driver?')) {
                deleteDriver(id);
                renderDriversTable();
            }
        });
    });
}

function openDriverModal(driverId = null) {
    const modal = document.getElementById('driverModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('driverForm');

    if (!modal) return;

    title.textContent = driverId ? 'Edit Driver' : 'Add New Driver';
    form.reset();
    document.getElementById('driverId').value = '';

    if (driverId) {
        const drivers = getDrivers();
        const driver = drivers.find(d => d.id === driverId);
        if (driver) {
            document.getElementById('driverId').value = driver.id;
            document.getElementById('driverName').value = driver.name;
            document.getElementById('driverPhone').value = driver.phone;
            document.getElementById('driverExperience').value = driver.experience;
            document.getElementById('driverLicense').value = driver.license;
            document.getElementById('driverStatus').value = driver.status;
        }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function handleDriverSubmit() {
    const driverData = {
        name: document.getElementById('driverName').value.trim(),
        phone: document.getElementById('driverPhone').value.trim(),
        experience: document.getElementById('driverExperience').value.trim(),
        license: document.getElementById('driverLicense').value.trim(),
        status: document.getElementById('driverStatus').value
    };

    const currentId = document.getElementById('driverId').value;

    if (currentId) {
        driverData.id = currentId;
        updateDriver(driverData);
    } else {
        addDriver(driverData);
    }

    document.getElementById('driverModal').classList.remove('active');
    document.body.style.overflow = '';
    renderDriversTable();
}

// Verification Modal Logic
function openViewDriverModal(driverId) {
    const modal = document.getElementById('viewDriverModal');
    if (!modal) return;

    const drivers = getDrivers();
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    // Set global for verification actions
    window.currentViewingDriverId = driverId;

    document.getElementById('viewDriverName').textContent = driver.name;
    document.getElementById('viewDriverPhone').textContent = driver.phone;
    document.getElementById('viewDriverExperience').textContent = driver.experience;
    document.getElementById('viewDriverLicense').textContent = driver.license;
    document.getElementById('viewDriverStatusBadge').innerHTML = getStatusBadge(driver.status);

    renderVerificationStepper(driver.status);

    const actionBtns = document.getElementById('verificationActionBtns');
    const nextBtn = document.getElementById('nextVerificationBtn');

    if (driver.status === 'Verified' || driver.status === 'Rejected') {
        actionBtns.style.display = 'none';
    } else {
        actionBtns.style.display = 'flex';
        const steps = ['Registration Received', 'Police Verification', 'Background Check', 'Verified'];
        const currentIndex = steps.indexOf(driver.status);
        if (currentIndex !== -1 && currentIndex < steps.length - 1) {
            nextBtn.textContent = `Initiate ${steps[currentIndex + 1]}`;
            if (steps[currentIndex + 1] === 'Verified') nextBtn.textContent = 'Mark as Verified';
        }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function renderVerificationStepper(currentStatus) {
    const stepper = document.getElementById('verificationStepper');
    if (!stepper) return;

    const steps = ['Registration Received', 'Police Verification', 'Background Check', 'Verified'];
    const stepsEls = stepper.querySelectorAll('.step');
    const linesEls = stepper.querySelectorAll('.step-line');

    let statusIndex = steps.indexOf(currentStatus);
    const isRejected = currentStatus === 'Rejected';

    stepsEls.forEach((step, index) => {
        step.className = 'step';
        if (isRejected) {
            if (index === 0) step.classList.add('rejected');
        } else {
            if (index < statusIndex) step.classList.add('completed');
            else if (index === statusIndex) step.classList.add('current');
        }
    });

    linesEls.forEach((line, index) => {
        line.className = 'step-line';
        if (!isRejected && index < statusIndex) line.classList.add('completed');
    });
}

// Global verification actions
window.initVerificationActions = function () {
    const rejectBtn = document.getElementById('rejectDriverBtn');
    const nextBtn = document.getElementById('nextVerificationBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const closeBtn = document.getElementById('closeViewModalBtn');

    rejectBtn?.addEventListener('click', () => {
        if (confirm('Are you sure you want to reject this driver?')) {
            updateDriverStatus(window.currentViewingDriverId, 'Rejected');
            openViewDriverModal(window.currentViewingDriverId);
            renderDriversTable();
        }
    });

    nextBtn?.addEventListener('click', () => {
        const drivers = getDrivers();
        const driver = drivers.find(d => d.id === window.currentViewingDriverId);
        const steps = ['Registration Received', 'Police Verification', 'Background Check', 'Verified'];
        let currentIndex = steps.indexOf(driver.status);
        if (currentIndex !== -1 && currentIndex < steps.length - 1) {
            updateDriverStatus(window.currentViewingDriverId, steps[currentIndex + 1]);
            openViewDriverModal(window.currentViewingDriverId);
            renderDriversTable();
        }
    });

    downloadPdfBtn?.addEventListener('click', () => {
        const drivers = getDrivers();
        const driver = drivers.find(d => d.id === window.currentViewingDriverId);
        if (!driver) return;
        const text = `DRIVER REGISTRATION: ${driver.name}\nID: ${driver.id}\nPhone: ${driver.phone}\nStatus: ${driver.status}`;
        const blob = new Blob([text], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Driver_${driver.id}.txt`;
        link.click();
    });

    closeBtn?.addEventListener('click', () => {
        document.getElementById('viewDriverModal').classList.remove('active');
        document.body.style.overflow = '';
    });
};

function updateDriverStatus(id, newStatus) {
    const drivers = getDrivers();
    const index = drivers.findIndex(d => d.id === id);
    if (index !== -1) {
        drivers[index].status = newStatus;
        saveDrivers(drivers);
    }
}


// If on drivers page, init actions
if (window.location.pathname.includes('drivers.html')) {
    window.addEventListener('load', () => {
        if (typeof window.initVerificationActions === 'function') {
            window.initVerificationActions();
        }
    });
}
