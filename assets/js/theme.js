// theme.js - Shared Dark/Light Mode Handler (runs on every app page)
// Applies saved theme immediately (as early in <body> as possible) to avoid flash,
// and keeps the Settings page toggle in sync.
//
// Also provides a shared "gender-based avatar" fallback: if a user hasn't
// uploaded/pasted their own profile picture, we show a Male or Female
// placeholder avatar (built as an inline SVG, so it works offline) instead
// of one generic picture for everyone.

const OLD_PLACEHOLDER_DP = "https://via.placeholder.com/150"; // legacy default some old accounts may have

const MALE_AVATAR_SVG = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
    "<rect width='100' height='100' fill='#4A90D9'/>" +
    "<circle cx='50' cy='36' r='18' fill='#ffffff'/>" +
    "<path d='M18 92 C18 65 34 58 50 58 C66 58 82 65 82 92 Z' fill='#ffffff'/>" +
    "</svg>";

const FEMALE_AVATAR_SVG = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
    "<rect width='100' height='100' fill='#E85D9B'/>" +
    "<circle cx='50' cy='36' r='18' fill='#ffffff'/>" +
    "<path d='M18 92 C18 65 34 58 50 58 C66 58 82 65 82 92 Z' fill='#ffffff'/>" +
    "<circle cx='38' cy='14' r='6' fill='#ffffff'/>" +
    "<circle cx='62' cy='14' r='6' fill='#ffffff'/>" +
    "<circle cx='50' cy='10' r='6' fill='#ffffff'/>" +
    "</svg>";

const NEUTRAL_AVATAR_SVG = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
    "<rect width='100' height='100' fill='#8a8f98'/>" +
    "<circle cx='50' cy='36' r='18' fill='#ffffff'/>" +
    "<path d='M18 92 C18 65 34 58 50 58 C66 58 82 65 82 92 Z' fill='#ffffff'/>" +
    "</svg>";

function svgToDataUri(svg) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// Returns the right placeholder avatar for a gender ("Male" / "Female" / anything else)
window.getGenderAvatar = function (gender) {
    if (gender === "Male") return svgToDataUri(MALE_AVATAR_SVG);
    if (gender === "Female") return svgToDataUri(FEMALE_AVATAR_SVG);
    return svgToDataUri(NEUTRAL_AVATAR_SVG);
};

// Returns a user's own DP if they set one, otherwise a gender-appropriate placeholder
window.resolveAvatar = function (user) {
    if (!user) return svgToDataUri(NEUTRAL_AVATAR_SVG);
    if (user.profilePic && user.profilePic !== OLD_PLACEHOLDER_DP) return user.profilePic;
    return window.getGenderAvatar(user.gender);
};

(function () {
    const savedTheme = localStorage.getItem("app_theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) return;

    // Keep the toggle switch in sync with the actually-applied theme
    themeToggle.checked = document.body.classList.contains("dark-mode");

    themeToggle.addEventListener("change", (e) => {
        if (e.target.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("app_theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("app_theme", "light");
        }
    });
});
