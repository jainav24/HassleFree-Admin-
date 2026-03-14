/**
 * Settings Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const isSettingsPage = window.location.pathname.includes('settings.html');
    if (isSettingsPage) {
        initSettingsPage();
    }
});

function initSettingsPage() {
    const profileForm = document.querySelector('.card form');
    const systemSettingsBtn = document.querySelector('.card .btn-outline');

    profileForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Profile updated successfully!');
    });

    systemSettingsBtn?.addEventListener('click', () => {
        alert('System preferences applied!');
    });
}
