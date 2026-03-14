/* =========================================
   HassleFree Admin - Data Management
   ========================================= */

const StorageKeys = {
    DRIVERS: 'hasslefree_drivers',
    RIDES: 'hasslefree_rides',
    STATS: 'hasslefree_stats',
    REVENUE: 'hasslefree_revenue',
    SETTINGS: 'hasslefree_settings'
};

/** Global Helper: Get status badge HTML **/
function getStatusBadge(status) {
    switch (status) {
        // Driver Statuses
        case 'Registration Received': return '<span class="badge badge-warning">Reg. Received</span>';
        case 'Police Verification': return '<span class="badge" style="background:#e0f2fe; color:#0284c7;">Police Ver.</span>';
        case 'Background Check': return '<span class="badge" style="background:#f3e8ff; color:#9333ea;">Bg. Check</span>';
        case 'Verified': return '<span class="badge badge-success">Verified</span>';
        case 'Rejected': return '<span class="badge" style="background:#fee2e2; color:#ef4444;">Rejected</span>';
        
        // Ride Statuses
        case 'Completed': return '<span class="badge badge-success">Completed</span>';
        case 'In Progress': return '<span class="badge badge-primary">In Progress</span>';
        case 'Cancelled': return '<span class="badge badge-warning" style="background:#fee2e2; color:#ef4444;">Cancelled</span>';
        case 'Scheduled': return '<span class="badge badge-warning">Scheduled</span>';
        case 'Pending': return '<span class="badge badge-warning">Pending</span>';
        case 'Accepted': return '<span class="badge badge-success">Accepted</span>';
        case 'Reassigned': return '<span class="badge badge-primary" style="background:#e0f2fe; color:#0284c7;">Reassigned</span>';
        
        default: return `<span class="badge">${status}</span>`;
    }
}

// --- Initial Mock Data ---
const INITIAL_DRIVERS = [
    { id: 'DVR-001', name: 'Rajesh Kumar', phone: '+91 98765 43210', experience: '8 Years', license: 'MH-12-AB-1234', status: 'Verified', vehicle: 'Swift Dzire', joinDate: '10 Jan 2023', gender: 'Male' },
    { id: 'DVR-002', name: 'Priya Sharma', phone: '+91 87654 32109', experience: '5 Years', license: 'MH-14-CD-5678', status: 'Background Check', vehicle: 'Hyundai Aura', joinDate: '12 Feb 2023', gender: 'Female' },
    { id: 'DVR-003', name: 'Amit Patel', phone: '+91 76543 21098', experience: '12 Years', license: 'GJ-01-EF-9012', status: 'Verified', vehicle: 'Ertiga', joinDate: '05 Mar 2023', gender: 'Male' },
    { id: 'DVR-004', name: 'Sneha Desai', phone: '+91 65432 10987', experience: '3 Years', license: 'MH-02-GH-3456', status: 'Police Verification', vehicle: 'Honda Amaze', joinDate: '20 Mar 2023', gender: 'Female' },
    { id: 'DVR-005', name: 'Rahul Joshi', phone: '+91 91234 56789', experience: '10 Years', license: 'KA-03-IJ-7890', status: 'Verified', vehicle: 'Toyota Innova', joinDate: '15 Apr 2023', gender: 'Male' },
    { id: 'DVR-006', name: 'Anjali Nair', phone: '+91 92345 67890', experience: '6 Years', license: 'KL-05-KL-1234', status: 'Verified', vehicle: 'Maruti Ciaz', joinDate: '22 May 2023', gender: 'Female' },
    { id: 'DVR-007', name: 'Vikram Singh', phone: '+91 93456 78901', experience: '15 Years', license: 'DL-01-MN-5678', status: 'Verified', vehicle: 'Mahindra XUV700', joinDate: '30 Jun 2023', gender: 'Male' },
    { id: 'DVR-008', name: 'Kavita Rao', phone: '+91 94567 89012', experience: '4 Years', license: 'TS-09-OP-9012', status: 'Background Check', vehicle: 'TATA Nexon', joinDate: '10 Jul 2023', gender: 'Female' },
    { id: 'DVR-009', name: 'Sanjay Gupta', phone: '+91 95678 90123', experience: '7 Years', license: 'WB-02-QR-3456', status: 'Verified', vehicle: 'Hyundai Venue', joinDate: '18 Aug 2023', gender: 'Male' },
    { id: 'DVR-010', name: 'Meera Shah', phone: '+91 96789 01234', experience: '2 Years', license: 'GJ-05-ST-7890', status: 'Police Verification', vehicle: 'Renault Kwid', joinDate: '25 Sep 2023', gender: 'Female' },
    { id: 'DVR-011', name: 'Arjun Mallik', phone: '+91 97890 12345', experience: '9 Years', license: 'OD-02-UV-1234', status: 'Verified', vehicle: 'Kia Carens', joinDate: '05 Oct 2023', gender: 'Male' },
    { id: 'DVR-012', name: 'Deepika Padukone', phone: '+91 98901 23456', experience: '4 Years', license: 'MH-01-WX-5678', status: 'Verified', vehicle: 'Honda City', joinDate: '12 Nov 2023', gender: 'Female' },
    { id: 'DVR-013', name: 'Abhishek Bachchan', phone: '+91 99012 34567', experience: '11 Years', license: 'DL-04-YZ-9012', status: 'Background Check', vehicle: 'XUV 500', joinDate: '20 Nov 2023', gender: 'Male' },
    { id: 'DVR-014', name: 'Zara Khan', phone: '+91 90123 45678', experience: '6 Years', license: 'HR-26-AB-3456', status: 'Verified', vehicle: 'Maruti Brezza', joinDate: '01 Dec 2023', gender: 'Female' },
    { id: 'DVR-015', name: 'Ishan Sharma', phone: '+91 91234 56789', experience: '13 Years', license: 'PB-65-CD-7890', status: 'Police Verification', vehicle: 'Toyota Fortuner', joinDate: '15 Dec 2023', gender: 'Male' },
    { id: 'DVR-016', name: 'Manish Malhotra', phone: '+91 92345 61234', experience: '7 Years', license: 'MH-12-JK-5678', status: 'Verified', vehicle: 'Hyundai Creta', joinDate: '02 Jan 2024', gender: 'Male' },
    { id: 'DVR-017', name: 'Sushant Singh', phone: '+91 93456 72345', experience: '6 Years', license: 'BR-01-PQ-9012', status: 'Verified', vehicle: 'Tata Altroz', joinDate: '10 Jan 2024', gender: 'Male' },
    { id: 'DVR-018', name: 'Rani Mukerji', phone: '+91 94567 83456', experience: '14 Years', license: 'MH-04-RS-3456', status: 'Verified', vehicle: 'MG Hector', joinDate: '15 Jan 2024', gender: 'Female' },
    { id: 'DVR-019', name: 'Karan Johar', phone: '+91 95678 94567', experience: '3 Years', license: 'MH-01-TU-7890', status: 'Police Verification', vehicle: 'Kia Seltos', joinDate: '20 Jan 2024', gender: 'Male' },
    { id: 'DVR-020', name: 'Vidya Balan', phone: '+91 96789 05678', experience: '8 Years', license: 'MH-03-VW-1234', status: 'Verified', vehicle: 'Toyota Crysta', joinDate: '25 Jan 2024', gender: 'Female' }
];

const INITIAL_RIDES = [
    { id: 'RID-1049', customer: 'Rohan Mehta', driver: 'Rajesh Kumar', date: '2023-10-27 14:30', amount: '₹1,200', location: 'Airport to City Center', status: 'Completed' },
    { id: 'RID-1050', customer: 'Sonal Jain', driver: 'Anjali Nair', date: '2023-10-27 15:45', amount: '₹850', location: 'Bandra to Juhu', status: 'Completed' },
    { id: 'RID-1051', customer: 'Karan Singh', driver: 'Vikram Singh', date: '2023-10-27 16:15', amount: '₹2,000', location: 'Mumbai to Pune', status: 'Completed' },
    { id: 'RID-1052', customer: 'Deepa Rao', driver: 'Rajesh Kumar', date: '2023-10-27 17:00', amount: '₹500', location: 'Local Trip', status: 'Completed' },
    { id: 'RID-1053', customer: 'Arjun Das', driver: 'Rahul Joshi', date: '2023-10-28 09:00', amount: '₹1,500', location: 'Colaba to Worli', status: 'Accepted' },
    { id: 'RID-1054', customer: 'Neha Kapur', driver: 'Sanjay Gupta', date: '2023-10-28 10:30', amount: '₹600', location: 'Andheri to Powai', status: 'Completed' },
    { id: 'RID-1055', customer: 'Suresh Iyer', driver: 'Anjali Nair', date: '2023-10-28 12:00', amount: '₹950', location: 'Dadar to Nariman Point', status: 'In Progress' },
    { id: 'RID-1056', customer: 'Preeti Pal', driver: 'Rajesh Kumar', date: '2023-10-28 14:15', amount: '₹1,100', location: 'Goregaon to BKC', status: 'Completed' },
    { id: 'RID-1057', customer: 'Manish Pal', driver: 'Vikram Singh', date: '2023-10-28 16:00', amount: '₹2,500', location: 'Thane to Navi Mumbai', status: 'Completed' },
    { id: 'RID-1058', customer: 'Ritu Verma', driver: 'Rahul Joshi', date: '2023-10-29 08:30', amount: '₹400', location: 'Short Local', status: 'Completed' },
    { id: 'RID-1059', customer: 'Yash Goel', driver: 'Sanjay Gupta', date: '2023-10-29 11:45', amount: '₹1,350', location: 'Malad to Churchgate', status: 'Completed' },
    { id: 'RID-1060', customer: 'Tanu Jain', driver: 'Anjali Nair', date: '2023-10-29 15:00', amount: '₹750', location: 'Vile Parle to Santacruz', status: 'Completed' },
    { id: 'RID-1061', customer: 'Ishita Dutta', driver: 'Arjun Mallik', date: '2023-10-30 10:00', amount: '₹1,050', location: 'Borivali to Airport', status: 'Scheduled' },
    { id: 'RID-1062', customer: 'Vikash Oberoi', driver: 'Deepika Padukone', date: '2023-10-30 12:30', amount: '₹900', location: 'Khar to Lower Parel', status: 'Pending' },
    { id: 'RID-1063', customer: 'Simran Bagga', driver: 'Abhishek Bachchan', date: '2023-10-30 14:00', amount: '₹1,800', location: 'Worli to Thane', status: 'Completed' },
    { id: 'RID-1064', customer: 'Kartik Aaryan', driver: 'Manish Malhotra', date: '2023-11-01 09:15', amount: '₹1,200', location: 'Juhu to BKC', status: 'Completed' },
    { id: 'RID-1065', customer: 'Sara Ali Khan', driver: 'Rani Mukerji', date: '2023-11-01 11:30', amount: '₹1,500', location: 'Pali Hill to Colaba', status: 'Completed' },
    { id: 'RID-1066', customer: 'Varun Dhawan', driver: 'Vikram Singh', date: '2023-11-01 13:45', amount: '₹800', location: 'Andheri East to West', status: 'Completed' },
    { id: 'RID-1067', customer: 'Janhvi Kapoor', driver: 'Anjali Nair', date: '2023-11-02 10:00', amount: '₹1,100', location: 'Lokhandwala to Worli', status: 'Accepted' },
    { id: 'RID-1068', customer: 'Ranbir Kapoor', driver: 'Rajesh Kumar', date: '2023-11-02 15:30', amount: '₹3,000', location: 'Mumbai to Lonavala', status: 'In Progress' }
];

// --- Initialization ---
function initData() {
    // Check if data needs expansion (for existing users)
    const existingDrivers = JSON.parse(localStorage.getItem(StorageKeys.DRIVERS)) || [];
    if (existingDrivers.length < 15) {
        localStorage.setItem(StorageKeys.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
    }

    const existingRides = JSON.parse(localStorage.getItem(StorageKeys.RIDES)) || [];
    if (existingRides.length < 15) {
        localStorage.setItem(StorageKeys.RIDES, JSON.stringify(INITIAL_RIDES));
    }
    if (!localStorage.getItem(StorageKeys.STATS)) {
        localStorage.setItem(StorageKeys.STATS, JSON.stringify({
            totalDrivers: INITIAL_DRIVERS.length,
            pendingVerifications: 2,
            activeServices: 1,
            monthlyRevenue: 2050
        }));
    }
}

// --- Data Fetching & CRUD ---

// DRIVERS
function getDrivers() {
    return JSON.parse(localStorage.getItem(StorageKeys.DRIVERS)) || [];
}

function saveDrivers(drivers) {
    localStorage.setItem(StorageKeys.DRIVERS, JSON.stringify(drivers));
}

function addDriver(driver) {
    const drivers = getDrivers();
    const newId = `DVR-${String(drivers.length + 1).padStart(3, '0')}`;
    const newDriver = { id: newId, ...driver };
    drivers.push(newDriver);
    saveDrivers(drivers);
    return newDriver;
}

function updateDriver(updatedDriver) {
    const drivers = getDrivers();
    const index = drivers.findIndex(d => d.id === updatedDriver.id);
    if (index !== -1) {
        drivers[index] = { ...drivers[index], ...updatedDriver };
        saveDrivers(drivers);
    }
}

function deleteDriver(id) {
    const drivers = getDrivers();
    const filtered = drivers.filter(d => d.id !== id);
    saveDrivers(filtered);
}

// RIDES
function getRides() {
    return JSON.parse(localStorage.getItem(StorageKeys.RIDES)) || [];
}

function saveRides(rides) {
    localStorage.setItem(StorageKeys.RIDES, JSON.stringify(rides));
}

function addRide(ride) {
    const rides = getRides();
    const newId = `RID-${1000 + rides.length + 1}`;
    const newRide = { id: newId, ...ride };
    rides.push(newRide);
    saveRides(rides);
    return newRide;
}

function updateRide(updatedRide) {
    const rides = getRides();
    const index = rides.findIndex(r => r.id === updatedRide.id);
    if (index !== -1) {
        rides[index] = { ...rides[index], ...updatedRide };
        saveRides(rides);
    }
}

// STATS
function getStats() {
    const drivers = getDrivers();
    const rides = getRides();
    
    const totalDrivers = drivers.length;
    const pendingVerifications = drivers.filter(d => ['Registration Received', 'Police Verification', 'Background Check'].includes(d.status)).length;
    const activeServices = rides.filter(r => ['In Progress', 'Accepted', 'Scheduled'].includes(r.status)).length;
    
    // Dynamic Revenue Calculation
    const monthlyRevenue = rides
        .filter(r => r.status === 'Completed')
        .reduce((sum, r) => sum + (parseInt(r.amount.replace(/[^0-9.-]+/g, "")) || 0), 0);

    return {
        totalDrivers,
        pendingVerifications,
        activeServices,
        monthlyRevenue
    };
}

function updateDriverActivity(id, isActive) {
    const drivers = getDrivers();
    const index = drivers.findIndex(d => d.id === id);
    if (index !== -1) {
        drivers[index].isActive = isActive;
        saveDrivers(drivers);
    }
}

// Run init on load
initData();