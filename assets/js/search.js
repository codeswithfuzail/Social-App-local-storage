document.addEventListener("DOMContentLoaded", () => {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Please log in first!");
        window.location.href = "login.html";
        return;
    }

    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const fallbackDp = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

    // Populate Sidebar User Avatar (shown on every app page)
    const sidebarUserDp = document.getElementById("sidebarUserDp");
    const sidebarUserName = document.getElementById("sidebarUserName");
    const sidebarUserHandle = document.getElementById("sidebarUserHandle");
    if (sidebarUserDp) sidebarUserDp.src = window.resolveAvatar(currentUser);
    if (sidebarUserName) sidebarUserName.innerText = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username;
    if (sidebarUserHandle) sidebarUserHandle.innerText = `@${currentUser.username}`;

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.trim().toLowerCase();

            if (query === "") {
                searchResults.innerHTML = `
                    <div class="search-placeholder">
                        <i class="fa-solid fa-users-viewfinder"></i>
                        <p>Type a user's name above to see their profile and posts.</p>
                    </div>`;
                return;
            }

            const allUsers = JSON.parse(localStorage.getItem("users")) || [];
            const allPosts = JSON.parse(localStorage.getItem("app_posts")) || [];

            // Match user by first name, last name, or username
            const matchedUser = allUsers.find(u => {
                const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
                const username = (u.username || '').toLowerCase();
                return fullName.includes(query) || username.includes(query);
            });

            if (!matchedUser) {
                searchResults.innerHTML = `
                    <div class="no-user-found">
                        <i class="fa-solid fa-user-slash" style="font-size: 30px; color: #1877f2; margin-bottom: 10px;"></i>
                        <p>No user found matching "${query}"</p>
                    </div>`;
                return;
            }

            const fullName = `${matchedUser.firstName || ''} ${matchedUser.lastName || ''}`.trim() || matchedUser.username;
            const bio = matchedUser.bio || "No bio added yet.";
            const dp = window.resolveAvatar(matchedUser);

            // Filter posts belonging to this matched user
            const userPosts = allPosts.filter(p => p.username === matchedUser.username);

            let postsHtml = "";
            if (userPosts.length === 0) {
                postsHtml = `<div class="no-posts-msg"><p>This user hasn't posted anything yet.</p></div>`;
            } else {
                userPosts.forEach(post => {
                    let mediaHtml = '';
                    if (post.isYoutube && post.youtubeId) {
                        mediaHtml = `<div class="youtube-embed-wrap"><iframe src="https://www.youtube.com/embed/${post.youtubeId}" title="YouTube video" allowfullscreen></iframe></div>`;
                    } else if (post.media) {
                        mediaHtml = post.isVideo
                            ? `<video src="${post.media}" class="search-post-img" controls></video>`
                            : `<img src="${post.media}" class="search-post-img" alt="Post Image">`;
                    }
                    postsHtml += `
                        <div class="search-post-card">
                            <p class="search-post-text">${post.caption || ''}</p>
                            ${mediaHtml}
                        </div>
                    `;
                });
            }

            // Render Profile + Posts
            searchResults.innerHTML = `
                <div class="searched-user-profile">
                    <img src="${dp}" class="searched-dp" alt="${matchedUser.username}">
                    <div class="searched-info">
                        <h3>${fullName}</h3>
                        <div class="handle">@${matchedUser.username}</div>
                        <div class="bio">${bio}</div>
                        <div class="searched-actions">
                            <button class="btn btn-view" onclick="viewTargetProfile('${matchedUser.username}')">View Full Profile</button>
                        </div>
                    </div>
                </div>

                <div class="user-posts-section">
                    <h3>Posts by @${matchedUser.username}</h3>
                    <div class="search-posts-grid">
                        ${postsHtml}
                    </div>
                </div>
            `;
        });
    }

    // View Profile redirection helper
    window.viewTargetProfile = function (username) {
        localStorage.setItem("viewProfileUser", username);
        window.location.href = "profile.html";
    };

    // Logout Handler
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        });
    }
});