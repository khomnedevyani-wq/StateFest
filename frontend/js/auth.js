/**
 * StateFest - Authentication JavaScript (Register & Login)
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect away from login/register pages
  const user = Auth.getUser();
  const path = window.location.pathname;

  if (user && (path.includes('login.html') || path.includes('register.html'))) {
    if (user.role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'student-dashboard.html';
    }
    return;
  }

  // --- Registration Handler ---
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const phone = document.getElementById('phone').value.trim();
      const college = document.getElementById('college').value.trim();
      const course = document.getElementById('course').value.trim();
      const academicYear = document.getElementById('academicYear').value;

      // Client-side validations
      if (!name || !email || !password || !confirmPassword || !phone || !college || !course) {
        showToast('Please fill out all required fields.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match. Please re-enter.', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
      }

      const phoneClean = phone.replace(/[\s-]/g, '');
      if (phoneClean.length < 10) {
        showToast('Phone number must have at least 10 digits.', 'error');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Creating Account...';

      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            confirmPassword,
            phone,
            college,
            course,
            academicYear
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          Auth.setSession(data.token, data.user);
          showToast(data.message || 'Registration successful! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = 'student-dashboard.html';
          }, 1200);
        } else {
          showToast(data.message || 'Registration failed. Please try again.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      } catch (err) {
        showToast('Server connection error. Please make sure the backend is running.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // --- Login Handler ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        showToast('Please enter both email and password.', 'error');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Logging In...';

      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          Auth.setSession(data.token, data.user);
          showToast(`Welcome back, ${data.user.name}!`, 'success');

          setTimeout(() => {
            if (data.user.role === 'admin') {
              window.location.href = 'admin-dashboard.html';
            } else {
              window.location.href = 'student-dashboard.html';
            }
          }, 800);
        } else {
          showToast(data.message || 'Invalid email or password.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      } catch (err) {
        showToast('Server connection error. Please make sure the backend is running.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});

// Quick credential autofill helpers for examiners/viva
function fillStudentDemo() {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  if (emailInput && passwordInput) {
    emailInput.value = 'student@demo.com';
    passwordInput.value = 'Pass@123';
    showToast('Loaded demo student credentials.', 'info');
  }
}

function fillAdminDemo() {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  if (emailInput && passwordInput) {
    emailInput.value = 'admin@statefest.in';
    passwordInput.value = 'Admin@123';
    showToast('Loaded demo administrator credentials.', 'info');
  }
}
