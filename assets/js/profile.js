document.addEventListener("DOMContentLoaded", () => {
    // Current User Session Check
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Please log in first!");
        window.location.href = "login.html";
        return;
    }

    const fallbackDp = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";

    // Populate Sidebar User Avatar (always the logged-in user, shown on every app page)
    const sidebarUserDp = document.getElementById("sidebarUserDp");
    const sidebarUserName = document.getElementById("sidebarUserName");
    const sidebarUserHandle = document.getElementById("sidebarUserHandle");
    if (sidebarUserDp) sidebarUserDp.src = window.resolveAvatar(currentUser);
    if (sidebarUserName) sidebarUserName.innerText = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username;
    if (sidebarUserHandle) sidebarUserHandle.innerText = `@${currentUser.username}`;

    // Check if we're viewing someone else's profile (set by explorer.js / search.js)
    const allUsersForView = JSON.parse(localStorage.getItem("users")) || [];
    const viewProfileUsername = localStorage.getItem("viewProfileUser");
    localStorage.removeItem("viewProfileUser"); // consume the flag so a plain reload shows your own profile

    let viewedUser = currentUser;
    let isOwnProfile = true;

    if (viewProfileUsername && viewProfileUsername !== currentUser.username) {
        const found = allUsersForView.find(u => u.username === viewProfileUsername);
        if (found) {
            viewedUser = found;
            isOwnProfile = false;
        }
    }

    // 1. Render Profile Info
    function renderProfileInfo() {
        document.getElementById("userName").innerText = `${viewedUser.firstName || ''} ${viewedUser.lastName || ''}`.trim() || viewedUser.username;
        document.getElementById("userHandle").innerText = `@${viewedUser.username}`;
        document.getElementById("userBio").innerText = viewedUser.bio || "No bio added yet.";
        document.getElementById("userLocation").innerText = `${viewedUser.city || viewedUser.location || 'Karachi'}, Pakistan`;

        const userDpImg = document.getElementById("userDp");
        if (userDpImg) userDpImg.src = window.resolveAvatar(viewedUser);

        const coverImg = document.getElementById("coverImg");
        if (coverImg) {
            coverImg.src = viewedUser.coverPic || fallbackDp;
        }

        // Hide Edit Profile / Create Post actions when viewing someone else's profile
        const profileActions = document.querySelector(".profile-actions");
        if (profileActions) profileActions.style.display = isOwnProfile ? "" : "none";
    }

    // 2. Edit Profile Modal Controls
    const editModal = document.getElementById("editProfileModal");
    const openEditModalBtn = document.getElementById("openEditModalBtn");
    const closeEditModal = document.getElementById("closeEditModal");
    const editProfileForm = document.getElementById("editProfileForm");

    const openEditModalFromCoverBtn = document.getElementById("openEditModalFromCoverBtn");

    const openEditModal = () => {
        document.getElementById("editBioInput").value = currentUser.bio || '';
        document.getElementById("editLocationInput").value = currentUser.city || currentUser.location || '';
        editModal.classList.remove("hidden");
    };

    if (openEditModalBtn) openEditModalBtn.addEventListener("click", openEditModal);
    if (openEditModalFromCoverBtn) openEditModalFromCoverBtn.addEventListener("click", openEditModal);

    if (closeEditModal) {
        closeEditModal.addEventListener("click", () => editModal.classList.add("hidden"));
    }

    if (editProfileForm) {
        editProfileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newBio = document.getElementById("editBioInput").value.trim();
            const newLoc = document.getElementById("editLocationInput").value.trim();
            const dpFile = document.getElementById("editDpFile").files[0];
            const dpUrl = document.getElementById("editDpUrl").value.trim();
            const coverFile = document.getElementById("editCoverFile").files[0];
            const coverUrl = document.getElementById("editCoverUrl").value.trim();

            // Read DP (file takes priority over URL) as a Promise
            const readDp = () => new Promise((resolve) => {
                if (dpFile) {
                    const reader = new FileReader();
                    reader.onload = (evt) => resolve(evt.target.result);
                    reader.readAsDataURL(dpFile);
                } else {
                    resolve(dpUrl || null);
                }
            });

            // Read Cover Photo (file takes priority over URL) as a Promise
            const readCover = () => new Promise((resolve) => {
                if (coverFile) {
                    const reader = new FileReader();
                    reader.onload = (evt) => resolve(evt.target.result);
                    reader.readAsDataURL(coverFile);
                } else {
                    resolve(coverUrl || null);
                }
            });

            Promise.all([readDp(), readCover()]).then(([dpData, coverData]) => {
                currentUser.bio = newBio;
                currentUser.city = newLoc;
                if (dpData) currentUser.profilePic = dpData;
                if (coverData) currentUser.coverPic = coverData;

                localStorage.setItem("currentUser", JSON.stringify(currentUser));

                let users = JSON.parse(localStorage.getItem("users")) || [];
                users = users.map(u => u.username === currentUser.username ? currentUser : u);
                localStorage.setItem("users", JSON.stringify(users));

                renderProfileInfo();

                // Keep sidebar avatar in sync too
                if (sidebarUserDp && dpData) sidebarUserDp.src = dpData;

                editProfileForm.reset();
                editModal.classList.add("hidden");
            });
        });
    }

    // 3. Create Post Modal Controls
    const postModal = document.getElementById("postModal");
    const openPostModalBtn = document.getElementById("openPostModalBtn");
    const mobileCreatePostBtn = document.getElementById("mobileCreatePostBtn");
    const closePostModal = document.getElementById("closePostModal");

    if (openPostModalBtn) openPostModalBtn.addEventListener("click", () => postModal.classList.remove("hidden"));
    if (mobileCreatePostBtn) mobileCreatePostBtn.addEventListener("click", () => postModal.classList.remove("hidden"));
    if (closePostModal) closePostModal.addEventListener("click", () => postModal.classList.add("hidden"));

    const mediaRadios = document.querySelectorAll('input[name="mediaSource"]');
    const fileUploadGroup = document.getElementById("fileUploadGroup");
    const urlUploadGroup = document.getElementById("urlUploadGroup");
    const youtubeUploadGroup = document.getElementById("youtubeUploadGroup");

    mediaRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            fileUploadGroup.classList.add("hidden");
            urlUploadGroup.classList.add("hidden");
            youtubeUploadGroup.classList.add("hidden");
            if (e.target.value === "file") fileUploadGroup.classList.remove("hidden");
            if (e.target.value === "url") urlUploadGroup.classList.remove("hidden");
            if (e.target.value === "youtube") youtubeUploadGroup.classList.remove("hidden");
        });
    });

    // Extract an 11-char YouTube video ID from any common YouTube URL format
    function extractYoutubeId(url) {
        const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // 4. Create Post Logic (Local MP4 & Standard Image/Video URLs)
    const createPostForm = document.getElementById("createPostForm");
    if (createPostForm) {
        createPostForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const caption = document.getElementById("postCaption").value.trim();
            const selectedType = document.querySelector('input[name="mediaSource"]:checked').value;
            const mediaFile = document.getElementById("postMediaFile").files[0];
            const mediaUrl = document.getElementById("postMediaUrl").value.trim();
            const youtubeUrl = document.getElementById("postYoutubeUrl").value.trim();

            const processPost = (mediaRes, isVid, youtubeId) => {
                const posts = JSON.parse(localStorage.getItem("app_posts")) || [];
                posts.unshift({
                    id: Date.now(),
                    username: currentUser.username,
                    userDp: window.resolveAvatar(currentUser),
                    caption: caption,
                    media: mediaRes,
                    isVideo: isVid,
                    isYoutube: !!youtubeId,
                    youtubeId: youtubeId || null,
                    createdAt: "Just now"
                });
                localStorage.setItem("app_posts", JSON.stringify(posts));

                createPostForm.reset();
                fileUploadGroup.classList.add("hidden");
                urlUploadGroup.classList.add("hidden");
                youtubeUploadGroup.classList.add("hidden");
                postModal.classList.add("hidden");

                renderPosts();
            };

            if (selectedType === "file" && mediaFile) {
                const isVid = mediaFile.type.startsWith("video/");
                const reader = new FileReader();
                reader.onload = (evt) => processPost(evt.target.result, isVid);
                reader.readAsDataURL(mediaFile);
            } else if (selectedType === "url" && mediaUrl) {
                const isVid = mediaUrl.match(/\.(mp4|webm|ogg)$/i) !== null;
                processPost(mediaUrl, isVid);
            } else if (selectedType === "youtube" && youtubeUrl) {
                const ytId = extractYoutubeId(youtubeUrl);
                if (!ytId) {
                    alert("Yeh valid YouTube link nahi lag raha. Please check karke dobara try karein.");
                    return;
                }
                processPost(null, false, ytId);
            } else {
                processPost(null, false);
            }
        });
    }

    // 5. Render Feed Posts
    function renderPosts() {
        const postsFeed = document.getElementById("postsFeed");
        const postsCount = document.getElementById("postsCount");
        const allPosts = JSON.parse(localStorage.getItem("app_posts")) || [];

        const myPosts = allPosts.filter(p => p.username === viewedUser.username);
        if (postsCount) postsCount.innerText = myPosts.length;

        if (!postsFeed) return;

        if (myPosts.length === 0) {
            postsFeed.innerHTML = `<div class="no-posts"><p>No posts yet</p></div>`;
            return;
        }

        postsFeed.innerHTML = "";
        myPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            let mediaHTML = "";
            if (post.isYoutube && post.youtubeId) {
                mediaHTML = `<div class="youtube-embed-wrap"><iframe src="https://www.youtube.com/embed/${post.youtubeId}" title="YouTube video" allowfullscreen></iframe></div>`;
            } else if (post.media) {
                if (post.isVideo) {
                    mediaHTML = `<video src="${post.media}" class="post-media post-video" loop></video>`;
                } else {
                    mediaHTML = `<img src="${post.media}" class="post-media" alt="Post">`;
                }
            }

            card.innerHTML = `
                <div class="post-header">
                    <div class="post-author">
                        <img src="${post.userDp}" alt="DP">
                        <div>
                            <h4>${post.username}</h4>
                            <span>${post.createdAt}</span>
                        </div>
                    </div>
                    ${isOwnProfile ? `<button class="delete-btn" onclick="deletePost(${post.id})"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
                ${post.caption ? `<p class="post-caption">${post.caption}</p>` : ''}
                ${mediaHTML}
            `;
            postsFeed.appendChild(card);
        });

        // Click on video to Play/Pause
        document.querySelectorAll(".post-video").forEach(vid => {
            vid.addEventListener("click", () => vid.paused ? vid.play() : vid.pause());
        });
    }

    // Global Delete Function
    window.deletePost = function (id) {
        if (confirm("Delete this post?")) {
            let posts = JSON.parse(localStorage.getItem("app_posts")) || [];
            posts = posts.filter(p => p.id !== id);
            localStorage.setItem("app_posts", JSON.stringify(posts));
            renderPosts();
        }
    };

    // Logout Action
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        });
    }

    renderProfileInfo();
    renderPosts();
});