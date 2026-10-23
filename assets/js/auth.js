document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loader = document.getElementById('loader');

    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Form Fields ki values nikalna
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const username = document.getElementById('username').value.trim();
            const gender = document.querySelector('input[name="gender"]:checked').value;
            const age = document.getElementById('age').value;
            const email = document.getElementById('email').value.trim();
            const city = document.getElementById('city').value.trim();
            const country = document.getElementById('country').value.trim();
            const bio = document.getElementById('bio').value.trim();
            const password = document.getElementById('password').value;

            const profileFileInput = document.getElementById('profileFile');
            const profileUrlInput = document.getElementById('profileUrl').value.trim();

            // Password length check
            if (password.length < 8) {
                alert("Password kam az kam 8 characters ka hona chahiye.");
                return;
            }

            // LocalStorage se existing users mangwana
            let users = JSON.parse(localStorage.getItem('users')) || [];

            // Unique Username Check
            const usernameExists = users.some(user => user.username.toLowerCase() === username.toLowerCase());

            if (usernameExists) {
                alert("Yeh Username pehle se kisi ne liya hua hai! Koi aur try karein.");
                return;
            }

            // Function - User Object create karke store karna
            const saveUserAndProceed = (profilePicData) => {
                const newUser = {
                    firstName,
                    lastName,
                    username,
                    gender,
                    age,
                    email,
                    city,
                    country,
                    bio,
                    profilePic: profilePicData || null, // Koi pic na ho toh gender ke hisaab se avatar (Male/Female) dikhega
                    password
                };

                // Array me naya user push karke save karna
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));

                // 1. Success Alert Show karna
                alert("Successfully aapka account create ho gaya hai!");

                // 2. Alert OK karne ke baad Loader show karna
                loader.classList.remove('hidden');

                // 3. 2 Seconds ke baad Login page par redirect karna
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            };

            // Image Handle (File upload pehle check hoga, agar nahi hai toh URL)
            if (profileFileInput.files && profileFileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    saveUserAndProceed(e.target.result); // Base64 Image String
                };
                reader.readAsDataURL(profileFileInput.files[0]);
            } else {
                saveUserAndProceed(profileUrlInput);
            }
        });
    }
});