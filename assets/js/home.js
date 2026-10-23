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

    // Update Home Header DP
    const homeUserDp = document.getElementById("homeUserDp");
    if (homeUserDp) homeUserDp.src = window.resolveAvatar(currentUser);

    // Create Post Modal Controls
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

    // Create Post Handler
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
                    likes: [],
                    comments: [],
                    createdAt: "Just now"
                });
                localStorage.setItem("app_posts", JSON.stringify(posts));

                createPostForm.reset();
                fileUploadGroup.classList.add("hidden");
                urlUploadGroup.classList.add("hidden");
                youtubeUploadGroup.classList.add("hidden");
                postModal.classList.add("hidden");

                renderHomePosts();
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

    // Render Global News Feed
    function renderHomePosts() {
        const postsFeed = document.getElementById("homePostsFeed");
        const allPosts = JSON.parse(localStorage.getItem("app_posts")) || [];

        if (!postsFeed) return;

        if (allPosts.length === 0) {
            postsFeed.innerHTML = `<div class="no-posts"><p>No posts available yet.</p></div>`;
            return;
        }

        postsFeed.innerHTML = "";
        allPosts.forEach(post => {
            const isMyPost = post.username === currentUser.username;
            const isLiked = post.likes && post.likes.includes(currentUser.username);

            // Check follow state
            const followingList = currentUser.followingList || [];
            const isFollowing = followingList.includes(post.username);

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

            // Follow button logic (only if it's NOT my post)
            let followBtnHTML = "";
            if (!isMyPost) {
                followBtnHTML = `
                    <button class="btn-follow ${isFollowing ? 'following' : ''}" onclick="toggleFollow('${post.username}')">
                        ${isFollowing ? 'Following' : '+ Follow'}
                    </button>
                `;
            }

            // Render Comments List
            let commentsHTML = "";
            if (post.comments && post.comments.length > 0) {
                post.comments.forEach(c => {
                    commentsHTML += `
                        <div class="comment-item">
                            <strong>${c.username}:</strong> ${c.text}
                        </div>`;
                });
            }

            card.innerHTML = `
                <div class="post-header">
                    <div class="post-author">
                        <img src="${post.userDp || fallbackDp}" alt="DP">
                        <div>
                            <h4>${post.username}</h4>
                            <span>${post.createdAt}</span>
                        </div>
                    </div>
                    ${followBtnHTML}
                </div>
                ${post.caption ? `<p class="post-caption">${post.caption}</p>` : ''}
                ${mediaHTML}

                <!-- Post Actions Bar -->
                <div class="post-actions-bar">
                    <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                        <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> 
                        <span>${(post.likes && post.likes.length) || 0} Like</span>
                    </button>
                    <button class="action-btn" onclick="toggleCommentBox(${post.id})">
                        <i class="fa-regular fa-comment"></i> 
                        <span>${(post.comments && post.comments.length) || 0} Comment</span>
                    </button>
                    <button class="action-btn" onclick="sharePost('${post.caption || 'Check out this post!'}')">
                        <i class="fa-solid fa-share"></i> Share
                    </button>
                </div>

                <!-- Comments Box -->
                <div class="comments-container hidden" id="comment-box-${post.id}">
                    <div class="comments-list">${commentsHTML}</div>
                    <div class="comment-input-box">
                        <input type="text" id="input-comment-${post.id}" placeholder="Write a comment...">
                        <button class="btn btn-primary" onclick="addComment(${post.id})">Post</button>
                    </div>
                </div>
            `;
            postsFeed.appendChild(card);
        });

        // Video Play/Pause
        document.querySelectorAll(".post-video").forEach(vid => {
            vid.addEventListener("click", () => vid.paused ? vid.play() : vid.pause());
        });
    }

    // 1. Toggle Like Logic
    window.toggleLike = function (postId) {
        let posts = JSON.parse(localStorage.getItem("app_posts")) || [];
        posts = posts.map(post => {
            if (post.id === postId) {
                if (!post.likes) post.likes = [];
                const index = post.likes.indexOf(currentUser.username);
                if (index === -1) {
                    post.likes.push(currentUser.username);
                } else {
                    post.likes.splice(index, 1);
                }
            }
            return post;
        });
        localStorage.setItem("app_posts", JSON.stringify(posts));
        renderHomePosts();
    };

    // 2. Toggle Follow / Unfollow Logic
    window.toggleFollow = function (targetUsername) {
        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (!currentUser.followingList) currentUser.followingList = [];
        const index = currentUser.followingList.indexOf(targetUsername);

        if (index === -1) {
            // Follow User
            currentUser.followingList.push(targetUsername);
            currentUser.following = (currentUser.following || 0) + 1;
        } else {
            // Unfollow User
            currentUser.followingList.splice(index, 1);
            currentUser.following = Math.max(0, (currentUser.following || 0) - 1);
        }

        // Update Target User's Followers Count
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
        renderHomePosts();
    };

    // 3. Toggle Comments Box Display
    window.toggleCommentBox = function (postId) {
        const box = document.getElementById(`comment-box-${postId}`);
        if (box) box.classList.toggle("hidden");
    };

    // 4. Add Comment Logic
    window.addComment = function (postId) {
        const input = document.getElementById(`input-comment-${postId}`);
        const commentText = input.value.trim();

        if (!commentText) return;

        let posts = JSON.parse(localStorage.getItem("app_posts")) || [];
        posts = posts.map(post => {
            if (post.id === postId) {
                if (!post.comments) post.comments = [];
                post.comments.push({
                    username: currentUser.username,
                    text: commentText
                });
            }
            return post;
        });

        localStorage.setItem("app_posts", JSON.stringify(posts));
        renderHomePosts();
    };

    // 5. Share Link Handler
    window.sharePost = function (text) {
        if (navigator.share) {
            navigator.share({ title: 'SocialApp Post', text: text, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Post link copied to clipboard!");
        }
    };

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        });
    }

    renderHomePosts();
});