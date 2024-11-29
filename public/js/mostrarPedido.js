document.addEventListener('DOMContentLoaded', () => {
    // Obtener los datos del carrito del servidor
    fetch('/carrito/data')
        .then(response => response.json())
        .then(data => {
            const orderItems = document.getElementById('order-items');
            const orderTotal = document.getElementById('order-total');
            let total = 0; 

            data.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${item.nombre} (x${item.cantidad})</span>
                    <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
                `;
                orderItems.appendChild(li);
                total += item.precio * item.cantidad;
            });

            // Actualizar total
            orderTotal.textContent = total.toFixed(2);
        })
        .catch(err => console.error('Error fetching cart data:', err));
});
