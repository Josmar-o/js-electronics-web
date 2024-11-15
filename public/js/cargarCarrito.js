document.addEventListener('DOMContentLoaded', () => {
    // Obtener los productos del carrito al cargar la página
    fetch('/carrito')
        .then(response => response.json())
        .then(data => {
            const cartContent = document.getElementById('cartContent');
            if (data.length === 0) {
                cartContent.innerHTML = '<p>No tienes productos en el carrito.</p>';
            } else {
                console.log(data);
                data.forEach(product => {
                    // Crear los elementos HTML para cada producto
                    const cartItem = document.createElement('div');
                    cartItem.classList.add('cart-item');
                    cartItem.innerHTML = `
                        <div class="cart-item-img">
                            <img src="${product.imagen_url}" alt="${product.nombre}">
                        </div>
                        <div class="cart-item-desc">
                            <h2>${product.nombre}</h2>
                            <p>${product.procesador} | ${product.ram} RAM | ${product.rom} ${product.tipo_almacenamiento}</p>
                            <div class="price-row">
                                <h3>Precio:</h3>
                                <div class="price-container">
                                    <span class="price">$${product.precio}</span>
                                </div>
                            </div>
                            <div class="cant-row">
                            <h3>Cantidad:</h3>
                                 <div class="price-control">
                                    <form action="/carrito/decrease" method="POST">
                                        <input type="hidden" name="producto_id" value="${product.id}">
                                        <button type="submit" class="decrease-quantity">-</button>
                                    </form>
                                    <span class="quantity">${product.cantidad}</span>
                                    <form action="/carrito/increase" method="POST">
                                        <input type="hidden" name="producto_id" value="${product.id}">
                                        <button type="submit" class="increase-quantity">+</button>
                                    </form>
                                    <form action="/carrito/delete" method="POST">
                                        <input type="hidden" name="producto_id" value="${product.id}">
                                        <button type="submit" class="delete-item">Eliminar</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    `;
                    cartContent.appendChild(cartItem);
                });
            }
        })
        .catch(error => {
            console.error('Error al cargar el carrito:', error);
        });
});
