

document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const errorMessage = document.getElementById('errorMessage');
    
    // Pre-fill based on selected role
    roleSelect.addEventListener('change', function() {
        const role = this.value;
        const credentials = {
            'commander': {username: 'commander', password: 'secure123'},
            'cybersecurity': {username: 'cyber_officer', password: 'secure123'},
            'administrator': {username: 'sys_admin', password: 'secure123'},
            'ict': {username: 'ict_staff', password: 'secure123'}
        };
        
        if (credentials[role]) {
            usernameInput.value = credentials[role].username;
            passwordInput.value = credentials[role].password;
        }
    });
    
    // Set initial values
    roleSelect.dispatchEvent(new Event('change'));
    
    loginBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }
        
        // Show loading state
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        loginBtn.disabled = true;
        
        // Send login request to backend
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store user info in sessionStorage
                sessionStorage.setItem('sb-ccms-user', JSON.stringify(data.user));
                
                // Redirect to dashboard
                window.location.href = '/';
            } else {
                showError('Authentication failed. Invalid credentials.');
                loginBtn.innerHTML = '<i class="fas fa-lock"></i> Secure Login';
                loginBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showError('Connection error. Please try again.');
            loginBtn.innerHTML = '<i class="fas fa-lock"></i> Secure Login';
            loginBtn.disabled = false;
        });
    });
    
    // Allow Enter key to submit
    passwordInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            loginBtn.click();
        }
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
});