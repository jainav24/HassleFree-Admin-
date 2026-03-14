/**
 * Layout Logic: Sidebar, Header, and common interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    initLayout();
});

function initLayout() {
    renderSidebar();
    renderHeader();
    initSidebarInteractions();
    initHeaderInteractions();
    highlightActiveNavItem();
}

function renderSidebar() {
    const sidebarEl = document.getElementById('sidebar');
    if (!sidebarEl) return;

    // Get current path to adjust asset links if in /admin/
    const isSubPage = window.location.pathname.includes('/admin/');
    const assetPrefix = isSubPage ? '../' : '';
    const pagePrefix = isSubPage ? '' : 'admin/';
    const homeLink = isSubPage ? '../index.html' : 'index.html';

    sidebarEl.innerHTML = `
        <div class="sidebar-header">
            <div class="logo">
                <img src="${assetPrefix}assets/Hasslelogo.png" alt="HassleFreeDrive Logo">
            </div>
            <button class="close-sidebar-btn" id="closeSidebar"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <nav class="sidebar-nav">
            <ul class="nav-links">
                <li class="nav-item">
                    <a href="${homeLink}" class="nav-link" data-page="dashboard">
                        <i class="fa-solid fa-chart-line"></i>
                        <span>Dashboard</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="${pagePrefix}drivers.html" class="nav-link" data-page="drivers">
                        <i class="fa-solid fa-id-card"></i>
                        <span>Drivers</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="${pagePrefix}rides.html" class="nav-link" data-page="rides">
                        <i class="fa-solid fa-car"></i>
                        <span>Rides</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="${pagePrefix}settings.html" class="nav-link" data-page="settings">
                        <i class="fa-solid fa-gear"></i>
                        <span>Settings</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="${pagePrefix}reports.html" class="nav-link" data-page="reports">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                        <span>Reports</span>
                    </a>
                </li>
            </ul>
        </nav>

        <div class="sidebar-footer">
            <a href="#" class="nav-link logout">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
                <span>Logout</span>
            </a>
        </div>
    `;
}

function renderHeader() {
    const headerEl = document.querySelector('.top-header');
    if (!headerEl) return;

    // Get current path to adjust header links
    const isSubPage = window.location.pathname.includes('/admin/');
    const pagePrefix = isSubPage ? '' : 'admin/';

    headerEl.innerHTML = `
        <div class="header-left">
            <button class="menu-toggle" id="menuToggle">
                <i class="fa-solid fa-bars"></i>
            </button>
            <div class="search-bar">
                <i class="fa-solid fa-search"></i>
                <input type="text" placeholder="Search drivers, rides...">
            </div>
        </div>
        <div class="header-right">
            <button class="icon-btn notifications">
                <i class="fa-regular fa-bell"></i>
                <span class="badge">3</span>
            </button>
            <div class="user-profile" id="userProfileBtn">
                <img src="https://ui-avatars.com/api/?name=Admin+User&background=0F9D58&color=fff" alt="Admin"
                    class="avatar">
                <div class="user-info">
                    <span class="user-name">Admin User</span>
                    <span class="user-role">Super Admin</span>
                </div>
                <i class="fa-solid fa-chevron-down"></i>
 
                <div class="dropdown-menu" id="adminDropdown">
                    <a href="${pagePrefix}settings.html" class="dropdown-item"><i class="fa-solid fa-user-gear"></i> Account Settings</a>
                    <a href="#" class="dropdown-item" id="notifDropdownItem"><i class="fa-solid fa-bell"></i> Notifications</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item logout"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</a>
                </div>
            </div>
        </div>
    `;
}

function initSidebarInteractions() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (!sidebar || !menuToggle || !closeSidebar || !sidebarOverlay) return;

    function openSidebar() {
        sidebar.classList.add('active');
        sidebarOverlay.style.display = 'block';
        requestAnimationFrame(() => sidebarOverlay.classList.add('active'));
        document.body.style.overflow = 'hidden';
    }

    function closeSidebarFn() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        sidebarOverlay.addEventListener('transitionend', () => {
            if (!sidebarOverlay.classList.contains('active')) {
                sidebarOverlay.style.display = 'none';
            }
        }, { once: true });
        document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', openSidebar);
    closeSidebar.addEventListener('click', closeSidebarFn);
    sidebarOverlay.addEventListener('click', closeSidebarFn);

    // Logout logic
    document.querySelectorAll('.logout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                const isSubPage = window.location.pathname.includes('/admin/');
                window.location.href = isSubPage ? '../index.html' : 'index.html';
            }
        });
    });
}

function initHeaderInteractions() {
    const userProfileBtn = document.getElementById('userProfileBtn');
    const adminDropdown = document.getElementById('adminDropdown');

    if (!userProfileBtn || !adminDropdown) return;

    userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        adminDropdown.classList.toggle('active');
    });

    // Notifications feedback
    document.querySelector('.notifications')?.addEventListener('click', () => {
        alert('You have 3 new notifications.');
    });

    document.getElementById('notifDropdownItem')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('No new messages.');
    });

    document.addEventListener('click', () => {
        adminDropdown.classList.remove('active');
    });
}

function highlightActiveNavItem() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'dashboard';

    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        if (link.getAttribute('data-page') === (page === 'index' ? 'dashboard' : page)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Global Modal Closer Helper
window.closeAllModals = function () {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
};
