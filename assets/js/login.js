document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginUsername = document.getElementById("loginUsername");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const loader = document.getElementById("loader");
    const googleLoginBtn = document.getElementById("googleLoginBtn");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const inputUsername = loginUsername.value.trim().toLowerCase();
        const inputEmail = loginEmail.value.trim().toLowerCase();
        const inputPassword = loginPassword.value;

        // LocalStorage se saved users fetch karna
        const users = JSON.parse(localStorage.getItem("users")) || [];

        // Triple Match Check: Username, Email AUR Password teenon match hone chahiye
        const matchedUser = users.find(user =>
            user.username.toLowerCase() === inputUsername &&
            user.email.toLowerCase() === inputEmail &&
            user.password === inputPassword
        );

        if (matchedUser) {
            // Loader dikhana
            loader.classList.remove("hidden");

            // Logged In user session Save karna
            localStorage.setItem("currentUser", JSON.stringify(matchedUser));

            // Loader ke baad profile.html par redirect karna
            setTimeout(() => {
                loader.classList.add("hidden");
                window.location.href = "profile.html";
            }, 1500);

        } else {
            alert("Invalid Username, Email, or Password! Please check your details.");
        }
    });

    // Continue with Google Demo Action
    googleLoginBtn.addEventListener("click", () => {
        alert("Google Authentication feature coming soon!");
    });
});