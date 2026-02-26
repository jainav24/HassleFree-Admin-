/* =========================================
   Mock Data & LocalStorage Management
   ========================================= */

const StorageKeys = {
    DRIVERS: 'rm_drivers',
    RIDES: 'rm_rides',
    STATS: 'rm_stats'
};

// Initial Mock Data
const initialDrivers = [
    { id: 'DVR-001', name: 'Rajesh Kumar', phone: '+91 98765 43210', experience: '8 Years', license: 'MH-12-AB-1234', status: 'Verified', email: 'rajesh.k@example.com' },
    { id: 'DVR-002', name: 'Priya Sharma', phone: '+91 87654 32109', experience: '5 Years', license: 'MH-14-CD-5678', status: 'Background Check', email: 'priya.s@example.com' },
    { id: 'DVR-003', name: 'Amit Patel', phone: '+91 76543 21098', experience: '12 Years', license: 'GJ-01-EF-9012', status: 'Registration Received', email: 'amit.p@example.com' },
    { id: 'DVR-004', name: 'Sneha Desai', phone: '+91 65432 10987', experience: '3 Years', license: 'MH-02-GH-3456', status: 'Police Verification', email: 'sneha.d@example.com' },
];

const initialRides = [
    { id: 'RID-1049', customer: 'Rahul Verma', driver: 'Rajesh Kumar', date: '2023-10-27 14:30', amount: '₹1,200', status: 'Completed', location: 'Mumbai Central to Andheri' },
    { id: 'RID-1050', customer: 'Anjali Gupta', driver: 'Sneha Desai', date: '2023-10-27 15:45', amount: '₹850', status: 'Completed', location: 'Bandra to Juhu' },
    { id: 'RID-1051', customer: 'Vikram Singh', driver: 'Priya Sharma', date: '2023-10-27 16:15', amount: '₹2,000', status: 'Pending', location: 'Pune to Lonavala' },
    { id: 'RID-1052', customer: 'Neha Reddy', driver: 'Rajesh Kumar', date: '2023-10-27 17:00', amount: '₹500', status: 'Rejected', location: 'Dadar to Worli' },
    { id: 'RID-1053', customer: 'Rohan Mehta', driver: 'Sneha Desai', date: '2023-10-28 09:00', amount: '₹1,500', status: 'Accepted', location: 'Navi Mumbai to Thane' },
];

const initialStats = {
    totalDrivers: 42,
    activeRides: 12,
    revenueMonth: '₹1,24,500',
    avgRating: '4.8'
};

// Initialize Storage
function initStorage() {
    const dbVersion = localStorage.getItem('rm_version');
    if (dbVersion !== '1.1') {
        localStorage.clear();
        localStorage.setItem('rm_version', '1.1');
    }

    if (!localStorage.getItem(StorageKeys.DRIVERS)) {
        localStorage.setItem(StorageKeys.DRIVERS, JSON.stringify(initialDrivers));
    }
    if (!localStorage.getItem(StorageKeys.RIDES)) {
        localStorage.setItem(StorageKeys.RIDES, JSON.stringify(initialRides));
    }
    if (!localStorage.getItem(StorageKeys.STATS)) {
        localStorage.setItem(StorageKeys.STATS, JSON.stringify(initialStats));
    }
}

// =========================================
// Driver API
// =========================================
function getDrivers() {
    return JSON.parse(localStorage.getItem(StorageKeys.DRIVERS) || '[]');
}

function saveDrivers(drivers) {
    localStorage.setItem(StorageKeys.DRIVERS, JSON.stringify(drivers));
}

function addDriver(driver) {
    const drivers = getDrivers();
    // Generate a simple ID
    driver.id = 'DVR-' + Math.floor(1000 + Math.random() * 9000);
    // Add dummy email based on name
    driver.email = driver.name.toLowerCase().replace(' ', '.') + '@example.com';
    drivers.unshift(driver);
    saveDrivers(drivers);
    return driver;
}

function updateDriver(updatedDriver) {
    const drivers = getDrivers();
    const index = drivers.findIndex(d => d.id === updatedDriver.id);
    if (index !== -1) {
        // Keep existing email
        updatedDriver.email = drivers[index].email;
        drivers[index] = updatedDriver;
        saveDrivers(drivers);
        return true;
    }
    return false;
}

function deleteDriver(id) {
    const drivers = getDrivers();
    const filtered = drivers.filter(d => d.id !== id);
    saveDrivers(filtered);

    // Update total drivers stat
    const stats = getStats();
    stats.totalDrivers--;
    localStorage.setItem(StorageKeys.STATS, JSON.stringify(stats));
}

// =========================================
// Ride API
// =========================================
function getRides() {
    return JSON.parse(localStorage.getItem(StorageKeys.RIDES) || '[]');
}

function saveRides(rides) {
    localStorage.setItem(StorageKeys.RIDES, JSON.stringify(rides));
}

function addRide(ride) {
    const rides = getRides();
    ride.id = 'RID-' + Math.floor(1000 + Math.random() * 9000);
    rides.unshift(ride);
    saveRides(rides);
    return ride;
}

function updateRide(updatedRide) {
    const rides = getRides();
    const index = rides.findIndex(r => r.id === updatedRide.id);
    if (index !== -1) {
        rides[index] = updatedRide;
        saveRides(rides);
        return true;
    }
    return false;
}

// =========================================
// Stats API
// =========================================
function getStats() {
    return JSON.parse(localStorage.getItem(StorageKeys.STATS) || '{}');
}

// Run init on load
initStorage();
