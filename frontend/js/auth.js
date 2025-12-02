/**
 * Authentication Logic
 * ---------------------
 * Handles User Login and Registration using the API.
 * Dependencies: js/api.js (fetchData function)
 */

// DOM이 완전히 로드된 후 이벤트 리스너를 설정합니다.
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        // login.html의 form 제출 이벤트를 handleLogin 함수와 연결
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        // register.html의 form 제출 이벤트를 handleRegister 함수와 연결
        registerForm.addEventListener('submit', handleRegister);
    }
});
/**
 * Handle Login Process
 * 1. Get input values.
 * 2. Send POST request to /login.
 * 3. Save JWT token to localStorage.
 */
async function handleLogin(event) {
    event.preventDefault(); // form의 기본 제출 동작(새로고침) 방지

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Basic Validation
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        // 1. Request Login to Server
        const response = await fetchData('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // 2. If successful, store the token
        if (response.accessToken) {
            localStorage.setItem('token', response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            alert(`Welcome back, ${response.user.username || 'Traveler'}!`);
            window.location.href = 'index.html'; // Redirect to Home
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed. Please check your email or password.");
    }
}

/**
 * Handle Registration Process
 * 1. Get input values.
 * 2. Send POST request to /register.
 * 3. Redirect to login page upon success.
 */
async function handleRegister(event) {
    event.preventDefault(); // form의 기본 제출 동작(새로고침) 방지

    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const username = document.getElementById('reg-username').value;

    // Basic Validation
    if (!email || !password || !username) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // 1. Request Registration to Server
        // json-server-auth requires 'email' and 'password'.
        await fetchData('/register', {
            method: 'POST',
            body: JSON.stringify({ 
                email, 
                password, 
                username // Additional user info
            })
        });

        alert("Registration successful! Please sign in.");
        window.location.href = 'login.html'; // Redirect to Login page

    } catch (error) {
        console.error("Register Error:", error);
        alert("Registration failed. This email might already be in use.");
    }
}