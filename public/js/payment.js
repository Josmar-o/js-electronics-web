const stripe = Stripe('pk_test_51QM4N8KYJOBJ3mZy5D59393kCGvjITVss0wY1bS7a2961gaQHqLtTu1yB0lLJPN25rI2W3dlIjtnoj4aNBC6OAVt00GlPmsXWY'); // Reemplaza con tu clave pública
const elements = stripe.elements();
const card = elements.create('card');
card.mount('#card-element');

// Llama a la API cuando se envíe el formulario de pago
document.getElementById('payment-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita el comportamiento predeterminado de enviar el formulario

    // Paso 1: Solicitar el client_secret y los detalles del usuario desde el backend
    const response = await fetch('/crear-pago', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // Pasamos cualquier dato necesario si es necesario (ej. carrito)
        }),
    });

    const { clientSecret, usuario, total } = await response.json();

    if (!clientSecret) {
        console.error('No se pudo obtener el client_secret del backend.');
        return;
    }

    // Paso 2: Confirmar el pago con Stripe.js
    const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: card, // Elemento de tarjeta
            billing_details: {
                name: usuario.nombre, // Nombre del usuario del backend
            },
        },
    });

    if (error) {
        console.error('Error al confirmar el pago:', error.message);
        alert('Error al procesar el pago. Intenta nuevamente.');
    } else {
        alert(`Pago confirmado con éxito. Total: ${total}`);
        
    }
});
