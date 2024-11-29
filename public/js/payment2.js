document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/isLoggedIn');  // Verificar si el usuario está autenticado
    const data = await response.json();

    if (!data.logged_in) {
        // Si el usuario no está autenticado, mostrar mensaje de inicio de sesión
        const paymentMessage = document.getElementById('payment-message');
        paymentMessage.innerHTML = '<p>Necesitas iniciar sesión para realizar el pago.</p>';
        paymentMessage.style.color = 'red';  
        return;  // No continuar con el resto del código
    }

    let stripe, elements, card;
    try {
        const configResponse = await fetch('/config');
        const config = await configResponse.json();
        stripe = Stripe(config.stripePublicKey);
        
        elements = stripe.elements();
        card = elements.create('card');
        card.mount('#card-element');
        
    } catch (error) {
        console.error('Error fetching Stripe public key:', error);
    }

    const paymentForm = document.getElementById('payment-form');
    const submitButton = document.getElementById('submit');
    const paymentMessage = document.getElementById('payment-message');

    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Crear el token de Stripe
        const {token, error} = await stripe.createToken(card);

        if (error) {
            paymentMessage.textContent = error.message;
        } else {
            // Enviar los datos al servidor sin recargar la página
            const paymentData = {
                payment_method: 'card',  // Método de pago seleccionado
                token: token.id,  // El token generado por Stripe
            };

            try {
                const response = await fetch('/procesar-pago', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(paymentData),
                });

                const data = await response.json();
                if (response.ok) {
                    window.location.href = `/html/confirmacion.html?pedido_id=${data.pedido_id}`; // Redirigir al usuario a la confirmación del pedido
                } else {
                    paymentMessage.textContent = data.error || 'Hubo un problema al procesar el pago.';
                }
            } catch (error) {
                paymentMessage.textContent = 'Hubo un error al procesar la solicitud.';
            }
        }
    });
});
