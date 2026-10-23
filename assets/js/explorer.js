document.addEventListener("DOMContentLoaded", () => {
    // Session Check
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

    // Render Registered Users Grid
    function renderExplorerUsers() {
        const usersGrid = document.getElementById("usersGrid");
        const allUsers = JSON.parse(localStorage.getItem("users")) || [];

        if (!usersGrid) return;

        // Current logged-in user ke ilawa baaki saare users filter karein
        const otherUsers = allUsers.filter(u => u.username !== currentUser.username);

        if (otherUsers.length === 0) {
            usersGrid.innerHTML = `
                <div class="no-users-found">
                    <i class="fa-solid fa-users-slash" style="font-size: 32px; color: #1877f2; margin-bottom: 10px;"></i>
                    <p>No other registered users found yet!</p>
                </div>`;
            return;
        }

        usersGrid.innerHTML = "";
        otherUsers.forEach(user => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
            const bio = user.bio || "No bio added yet.";
            const dp = window.resolveAvatar(user);

            // Check follow state
            const followingList = currentUser.followingList || [];
            const isFollowing = followingList.includes(user.username);

            const card = document.createElement("div");
            card.className = "user-card";

            card.innerHTML = `
                <img src="${dp}" class="user-card-dp" alt="${user.username}">
                <div class="user-card-name">${fullName}</div>
                <div class="user-card-handle">@${user.username}</div>
                <div class="user-card-bio">${bio}</div>
                <div class="user-card-actions">
                    <button class="btn btn-view-profile" onclick="viewUserProfile('${user.username}')">
                        View
                    </button>
                    <button class="btn btn-follow-user ${isFollowing ? 'following' : ''}" onclick="toggleFollowUser('${user.username}')">
                        ${isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>
            `;
            usersGrid.appendChild(card);
        });
    }

    // 1. Follow / Unfollow User Logic
    window.toggleFollowUser = function (targetUsername) {
        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (!currentUser.followingList) currentUser.followingList = [];
        const index = currentUser.followingList.indexOf(targetUsername);

        if (index === -1) {
            // Follow
            currentUser.followingList.push(targetUsername);
            currentUser.following = (currentUser.following || 0) + 1;
        } else {
            // Unfollow
            currentUser.followingList.splice(index, 1);
            currentUser.following = Math.max(0, (currentUser.following || 0) - 1);
        }

        // Update Target User Followers Count
        users = users.map(u => {
            if (u.username === targetUsername) {
                if (index === -1) {
                    u.followers = (u.followers || 0) + 1;
                } else {
                    u.followers = Math.max(0, (u.followers || 0) - 1);
                }
            }
            if (u.username === currentUser.username) {
                return currentUser;
            }
            return u;
        });

        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        localStorage.setItem("users", JSON.stringify(users));

        renderExplorerUsers();
    };

    // 2. View Profile Logic
    window.viewUserProfile = function (username) {
        // Targeted user ko local storage me view mode ke liye save karein
        localStorage.setItem("viewProfileUser", username);
        window.location.href = "profile.html";
    };

    // Logout Action
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        });
    }

    renderExplorerUsers();
});