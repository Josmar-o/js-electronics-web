const form = document.getElementById('add-to-cart-form');

form.addEventListener('submit', function (e) {
    e.preventDefault(); // Evitar el envío tradicional del formulario

    const productValue = document.getElementById('productValue').value;

    fetch('/carrito/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productValue: productValue }), // Enviar el producto seleccionado
    })
        .then((response) => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized');
                }
                return response.json().then((data) => {
                    throw new Error(data.message || 'Error al procesar la solicitud');
                });
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                // Producto agregado o actualizado exitosamente
                Swal.fire({
                    title: '¡Producto agregado!',
                    text: data.message,
                    icon: 'success',
                    confirmButtonText: 'Entendido',
                    allowOutsideClick: false,
                });
            } else {
                // Error relacionado con el stock
                Swal.fire({
                    title: 'Stock insuficiente',
                    text: data.message,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                });
            }
        })
        .catch((error) => {
            if (error.message === 'Unauthorized') {
                // Usuario no autenticado
                Swal.fire({
                    title: '¡Inicia sesión!',
                    text: 'Necesitas iniciar sesión para agregar productos al carrito.',
                    icon: 'warning',
                    confirmButtonText: 'Iniciar sesión',
                    allowOutsideClick: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Redirigir a la página de inicio de sesión
                        window.location.href = '/html/login.html'; // Ajustar según tu ruta de login
                    }
                });
            } else {
                // Otros errores
                Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    allowOutsideClick: false,
                });
            }
        });
});
