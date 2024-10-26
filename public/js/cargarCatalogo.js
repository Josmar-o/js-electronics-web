document.addEventListener('DOMContentLoaded', function() {
    fetch('/productos')
        .then(response => response.json())
        .then(data => {
            const catalogSection = document.querySelector('.catalog');
            data.forEach(product => {
                const productElement = `
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
                `;
                catalogSection.innerHTML += productElement;
            });
        })
        .catch(err => console.error(err));
});