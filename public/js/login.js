async function handleRegistration(event) {
    event.preventDefault(); 

    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validación de la longitud de la contraseña (mínimo 8 caracteres)
    if (password.length < 8) {
        Swal.fire({
            icon: 'error',
            title: 'Registro Fallido',
            text: 'La contraseña debe tener al menos 8 caracteres.',
        });
        return;
    }

    // Validación de coincidencia de contraseñas
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Registro Fallido',
            text: 'Las contraseñas no coinciden.',
        });
        return;
    }

    // Validación de la fuerza de la contraseña (opcional, puedes añadir más reglas es regex)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Al menos una letra y un número
    if (!passwordRegex.test(password)) {
        Swal.fire({
            icon: 'error',
            title: 'Registro Fallido',
            text: 'La contraseña debe tener al menos 8 caracteres, incluyendo una letra y un número.',
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
                title: 'Registro Exitoso',
                text: result.message,
            }).then(() => {
                toggleForm();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Registro Fallido',
                text: result.error || 'Por favor intente de nuevo.',
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Un error ocurrió',
            text: 'Por favor intente de nuevo luego.',
        });
    }
}


async function handleLogin(event) {

event.preventDefault();

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
        title: 'Login Exitoso',
        text: result.message,
    }).then(() => {

        window.location.href = result.redirectUrl;

    });
} else {
    Swal.fire({
        icon: ' error',
        title: 'Login Fallido',
        text: result.message,
    });

    document.getElementById('password').value = '';
}
} catch (error) {
console.error('Error:', error);
Swal.fire({
    icon: 'error',
    title: 'Un error ocurrió',
    text: 'Por favor intente de nuevo luego.',
});
}
}
