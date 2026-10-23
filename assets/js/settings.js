document.addEventListener("DOMContentLoaded", () => {
    // Current User Session
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Please log in first!");
        window.location.href = "login.html";
        return;
    }

    const fallbackDp = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

    // Populate Sidebar User Avatar (shown on every app page)
    const sidebarUserDp = document.getElementById("sidebarUserDp");
    const sidebarUserName = document.getElementById("sidebarUserName");
    const sidebarUserHandle = document.getElementById("sidebarUserHandle");
    if (sidebarUserDp) sidebarUserDp.src = window.resolveAvatar(currentUser);
    if (sidebarUserName) sidebarUserName.innerText = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username;
    if (sidebarUserHandle) sidebarUserHandle.innerText = `@${currentUser.username}`;

    // 1. Dark Mode Toggle System is now handled globally by assets/js/theme.js

    // 2. Change Password Logic
    const changePasswordForm = document.getElementById("changePasswordForm");
    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const oldPassword = document.getElementById("oldPassword").value;
            const newPassword = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            // Check current password
            if (oldPassword !== currentUser.password) {
                alert("Incorrect current password!");
                return;
            }

            // Confirm new password match
            if (newPassword !== confirmPassword) {
                alert("New passwords do not match!");
                return;
            }

            // Update Password in Current User Session & Users Database
            currentUser.password = newPassword;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            let users = JSON.parse(localStorage.getItem("users")) || [];
            users = users.map(u => u.username === currentUser.username ? currentUser : u);
            localStorage.setItem("users", JSON.stringify(users));

            alert("Password updated successfully!");
            changePasswordForm.reset();
        });
    }

    // 3. Logout Handlers
    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        }
    };

    const logoutBtnSidebar = document.getElementById("logoutBtnSidebar");
    const logoutBtnMain = document.getElementById("logoutBtnMain");

    if (logoutBtnSidebar) logoutBtnSidebar.addEventListener("click", handleLogout);
    if (logoutBtnMain) logoutBtnMain.addEventListener("click", handleLogout);
});