async function handleRegistration(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: 'Passwords do not match.',
        });
        return;
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
        });

        const result = await response.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: result.message,
            }).then(() => {
                // Optionally, redirect to login or another page
                toggleForm();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: result.error || 'Please try again later.',
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'An error occurred',
            text: 'Please try again later.',
        });
    }
}

async function handleLogin(event) {

event.preventDefault(); // Prevent the form from submitting normally

const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

try {
const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});

const result = await response.json();

if (result.success) {
    Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: result.message,
    }).then(() => {
        // Redirect to another page after the alert
        window.location.href = result.redirectUrl;

    });
} else {
    Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: result.message,
    });
    // Clear only the password field if login failed
    document.getElementById('password').value = '';
}
} catch (error) {
console.error('Error:', error);
Swal.fire({
    icon: 'error',
    title: 'An error occurred',
    text: 'Please try again later.',
});
}
}
