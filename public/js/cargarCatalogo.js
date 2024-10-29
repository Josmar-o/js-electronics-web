document.addEventListener('DOMContentLoaded', function() {
    fetch('/count-products')
    .then(response => response.json())
    .then(total => {
        document.getElementById('total-products').textContent = `Total de productos: ${total}`;
    })
    .catch(err => console.error('Error fetching total products:', err));

    fetch('/productos')

        .then(response => response.json())
        .then(data => {
            const catalogSection = document.querySelector('.catalog');
            data.forEach(product => {
                const productElement = `
                    <a href="item.html?id=${product.id}" class="catalog-item-link">
                        <article class="catalog-item">
                            <img src="${product.imagen_url}" alt="${product.nombre}">
                            <hr>
                            <h2>${product.nombre}</h2>
                            <p>${product.procesador} | ${product.ram} RAM | ${product.rom} ${product.tipo_almacenamiento}</p>
                            <div class="price-container">
                                <span class="price">$${product.precio}</span>
                            </div>
                            <button class="add-to-cart"></button>
                        </article>
                    </a>
                `;
                catalogSection.innerHTML += productElement;
            });
        })
        .catch(err => console.error(err));
});
