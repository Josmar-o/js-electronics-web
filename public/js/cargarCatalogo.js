document.addEventListener('DOMContentLoaded', function() {
    const filtersForm = document.getElementById('filters-form');
    const catalogSection = document.querySelector('.products');

    // Función para cargar productos
    const loadProducts = (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `/productos${queryParams ? `?${queryParams}` : ''}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                catalogSection.innerHTML = '';  // Limpiar el catálogo actual

                if (data.length === 0) {
                    catalogSection.innerHTML = '<p>No se encontraron productos.</p>';
                } else {
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
                                    <button class="add-to-cart" data-product-id="${product.id}"></button>
                                </article>
                            </a>
                        `;
                        catalogSection.innerHTML += productElement;
                    });

                    // Agregar un listener para cada botón de "Agregar al Carrito"
                    document.querySelectorAll('.add-to-cart').forEach(button => {
                        button.addEventListener('click', function(event) {
                            event.preventDefault(); // Prevenir el comportamiento predeterminado (por ejemplo, el enlace)

                            // Llama a la función para agregar al carrito
                            const productId = this.getAttribute('data-product-id');
                            addToCart(productId);

                            event.stopPropagation(); // Evita que el clic se propague y active el enlace
                        });
                    });
                }

                document.getElementById('total-products').textContent = `Total de productos: ${data.length}`;
            })
            .catch(err => console.error('Error fetching products:', err));
    };

    // Función para agregar al carrito
    const addToCart = (productId) => {
        fetch('/carrito/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productValue: productId })
        })
        .then(response => {
            if (response.ok) {
                alert('Producto agregado al carrito');
                // Opcional: Actualizar el número de productos en el carrito
            } else {
                console.error('Error al agregar al carrito');
            }
        })
        .catch(err => console.error('Error:', err));
    };

    // Cargar productos al inicio
    loadProducts();

    // Manejar el envío del formulario de filtros
    filtersForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const filters = {
            search: document.getElementById('search-input').value,
            minPrice: document.getElementById('min-price-input').value,
            maxPrice: document.getElementById('max-price-input').value,
            ram: document.getElementById('ram').value,
            procesador: document.getElementById('procesador').value,
            marca: document.getElementById('marca').value,
            tipo_almacenamiento: document.getElementById('tipo_almacenamiento').value,
            tamano_pantalla: document.getElementById('tamano_pantalla').value,
            resolucion_pantalla: document.getElementById('resolucion_pantalla').value,
            rom: document.getElementById('rom').value,
            sistema_operativo: document.getElementById('sistema_operativo').value,
            categoria: document.getElementById('categoria').value,
        };

        loadProducts(filters);
    });
});
