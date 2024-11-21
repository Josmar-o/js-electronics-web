const elements = stripe.elements();
  const card = elements.create('card');
  card.mount('#card-element');

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
                  window.location.href = `/html/confirmacion.html?pedido_id=${data.pedido_id}`;// Redirigir al usuario a la confirmación del pedido
              } else {
                  paymentMessage.textContent = data.error || 'Hubo un problema al procesar el pago.';
              }
          } catch (error) {
              paymentMessage.textContent = 'Hubo un error al procesar la solicitud.';
          }
      }
  });