const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session'); // Import express-session
const bcrypt = require('bcrypt'); // Install bcrypt for password hashing
const validator = require('validator');
const multer = require('multer');
const Stripe = require('stripe');


const app = express();

// Configure express-session
app.use(session({
    secret: 'my_development_secret_key', // Replace with a secure key in production
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Session expiry: 1 day
}));



// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'js_electronics'
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

app.use(express.json()); // To handle JSON in request body
app.use(express.urlencoded({ extended: true })); // To handle form data

// Authentication route for login
// Authentication route for login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            const user = results[0];

            // Compare password
            bcrypt.compare(password, user.contrasena, (err, match) => {
                if (match) {
                    req.session.user = {
                        id: user.id,
                        email: user.email,
                        nombre: user.nombre,
                        isAdmin: user.is_admin // Store isAdmin status in session
                    };

                    // Redirect based on admin status
                    if (user.is_admin) {
                        // Redirect to admin dashboard or HTML page
                        res.json({ success: true, redirectUrl: '/html/admin/dashboard.html' });
                    } else {
                        // Redirect to regular user profile or HTML page
                        res.json({ success: true, redirectUrl: '/html/home.html' });
                    }
                    console.log('Login successful');
                } else {
                    res.status(401).json({ message: 'Incorrect password' });
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});



// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

// Example of a protected route
// Add a product to the cart
app.post('/carrito/add', isAuthenticated, (req, res) => {
    const producto_id = req.body.productValue;
    const cantidad = 1;
    const usuario_id = req.session.user.id; // Get user ID from the session

    // SQL queries
    const sqlCarritoCheck = 'SELECT id FROM carrito WHERE usuario_id = ?';
    const sqlCarritoCreate = 'INSERT INTO carrito (usuario_id) VALUES (?)';
    const sqlCheckProduct = 'SELECT * FROM carrito_productos WHERE carrito_id = ? AND producto_id = ?';
    const sqlInsertProduct = 'INSERT INTO carrito_productos (carrito_id, producto_id, cantidad) VALUES (?, ?, ?)';
    const sqlUpdateProduct = 'UPDATE carrito_productos SET cantidad = cantidad + ? WHERE carrito_id = ? AND producto_id = ?';

    // Step 1: Check if the user already has a carrito
    db.query(sqlCarritoCheck, [usuario_id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        let carrito_id;

        if (result.length > 0) {
            // User already has a carrito, get the carrito_id
            carrito_id = result[0].id;
            addProductToCarrito(carrito_id);
        } else {
            // No carrito found, create one
            db.query(sqlCarritoCreate, [usuario_id], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                carrito_id = result.insertId;
                addProductToCarrito(carrito_id);
            });
        }

        // Step 2: Function to add product to the carrito
        function addProductToCarrito(carrito_id) {
            // Check if product is already in the cart
            db.query(sqlCheckProduct, [carrito_id, producto_id], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (result.length > 0) {
                    // Product already in cart, update quantity
                    db.query(sqlUpdateProduct, [cantidad, carrito_id, producto_id], (err) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ error: 'Database error' });
                        }
                        res.redirect('/html/item.html?id=' + producto_id);
                    });
                } else {
                    // Product not in cart, insert new row
                    db.query(sqlInsertProduct, [carrito_id, producto_id, cantidad], (err) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ error: 'Database error' });
                        }

                        res.redirect('/html/item.html?id=' + producto_id); // Redirect to the product page after adding
                    });
                }
            });
        }
    });
});



// View cart contents
// Ruta para obtener los productos en el carrito

app.get('/carrito', isAuthenticated, (req, res) => {
    const usuario_id = req.session.user.id;

    // Fetch cart items for the user
    const sql = `
        SELECT p.*, cp.cantidad, 
            (SELECT pi.imagen_url FROM producto_imagenes pi WHERE pi.producto_id = p.id LIMIT 1) AS imagen_url
        FROM carrito_productos cp
        JOIN productos p ON cp.producto_id = p.id
        WHERE cp.carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?);

    `;
    db.query(sql, [usuario_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/carrito/increase', (req, res) => {
    const producto_id = req.body.producto_id;
    const usuario_id = req.session.user.id

    db.query(`
        UPDATE carrito_productos
        SET cantidad = cantidad + 1
        WHERE carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?) AND producto_id = ?`, 
        [usuario_id, producto_id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al actualizar la cantidad.');
            }
            res.redirect('/html/carrito.html'); 
        });
});


app.post('/carrito/decrease', (req, res) => {
    const producto_id = req.body.producto_id;
    const usuario_id = req.session.user.id

    db.query(`
        UPDATE carrito_productos
        SET cantidad = cantidad - 1
        WHERE carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?) AND producto_id = ?
        AND cantidad > 1`, [usuario_id, producto_id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al actualizar la cantidad.');
            }
            res.redirect('/html/carrito.html');  // Redirect back to the cart page after updating
        });
});

app.post('/carrito/delete', (req, res) => {
    const producto_id = req.body.producto_id;
    const usuario_id = req.session.user.id

    db.query(`
        DELETE FROM carrito_productos
        WHERE carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?) AND producto_id = ?`, 
        [usuario_id, producto_id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error al eliminar el producto.');
            }
            res.redirect('/html/carrito.html');  // Redirect back to the cart page after deleting the item
        });
});




// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.json({ message: 'Logout successful' });
    });
});



app.post('/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Input validation
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Error hashing password' });
        
        const sql = 'INSERT INTO usuarios (nombre, apellido, email, contrasena) VALUES (?, ?, ?, ?)';
        db.query(sql, [firstName, lastName, email, hash], (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ success: true, message: 'Registration successful' });
        });
    });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



//NOTES OF CHANGING will need to change every static css and img as /css or /img instead of /public
//app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'public' folder 
app.use('/public', express.static(path.join(__dirname, 'public'))); 
// Serve images from the 'images_laptops' folder
app.use('/img_laptops', express.static(path.join(__dirname, 'img_laptops') , { index: false }));
//
app.use('/html', express.static(path.join(__dirname, 'html'))); 

// Fetch products from the database
app.get('/productos', (req, res) => {
    const sql = 'SELECT *, (SELECT producto_imagenes.imagen_url FROM producto_imagenes WHERE producto_imagenes.producto_id = productos.id LIMIT 1) AS imagen_url FROM productos;';
    
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
});

//fetch news from db
app.get('/news', (req, res) => {
    const sql = 'select * from blog';
    
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
});

// Serve your HTML file (for the catalog page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/html/home.html')); // Make sure you have the HTML file
});



// Route to fetch a single product's details by ID
app.get('/productos/:id', (req, res) => {
    const productId = req.params.id;
    const sql = `
        SELECT *, 
        (SELECT producto_imagenes.imagen_url FROM producto_imagenes WHERE producto_imagenes.producto_id = productos.id LIMIT 1) AS imagen_url 
        FROM productos 
        WHERE id = ?;`; // Add condition to fetch specific product

    db.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.length > 0) {
            res.json(result[0]); // Send the product details back
        } else {
            res.status(404).json({ error: 'Product not found' }); // Handle product not found
        }
    });
});

// Route to get the total number of products
app.get('/count-products', (req, res) => {
    const sql = 'SELECT COUNT(*) AS total FROM productos;'; // Query to count total products

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(result[0].total); // Send back the total count
    });
});


app.get('/get-session-info', (req, res) => {
    if (req.session.user) {
        res.json({ is_admin: req.session.user.isAdmin });  // Use isAdmin here
    } else {
        res.json({ is_admin: false });
    }
});



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'img_laptops'));  // Set destination folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);  // Get file extension
        cb(null, Date.now() + ext);  // Set file name to the current timestamp to avoid overwriting
    }
});

const upload = multer({ storage: storage });

// Middleware for authentication
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

// Route to display product form
app.get('/add-product', (req, res) => {
    res.sendFile(path.join(__dirname, 'product_upload.html'));
});

// Handle the form submission to add product
app.post('/add-product', upload.array('imagenes', 5), (req, res) => {
    const { nombre, descripcion, procesador, ram, rom, tipo_almacenamiento, precio, stock, tamano_pantalla, resolucion_pantalla, sistema_operativo, tarjeta_grafica, peso, dimensiones, garantia_meses, categoria, marca, fecha_lanzamiento } = req.body;

    // Validate the input fields
    if (!nombre || !descripcion || !procesador || !ram || !rom || !tipo_almacenamiento || !precio || !stock || !tamano_pantalla || !resolucion_pantalla || !sistema_operativo || !tarjeta_grafica || !peso || !dimensiones || !garantia_meses || !categoria || !marca || !fecha_lanzamiento) {
        return res.status(400).json({ message: 'Please fill all the fields.' });
    }

    const productData = {
        nombre,
        descripcion,
        procesador,
        ram,
        rom,
        tipo_almacenamiento,
        precio,
        stock,
        tamano_pantalla,
        resolucion_pantalla,
        sistema_operativo,
        tarjeta_grafica,
        peso,
        dimensiones,
        garantia_meses,
        categoria,
        marca,
        fecha_lanzamiento
    };

    // Insert product details into database
    const query = 'INSERT INTO productos SET ?';
    db.query(query, productData, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error inserting product into database.' });
        }

        // Get the inserted product ID
        const productId = result.insertId;

        // Save image URLs in database
        if (req.files) {
            req.files.forEach(file => {
                const imageData = {
                    producto_id: productId,
                    imagen_url: '/img_laptops/' + file.filename
                };
                db.query('INSERT INTO producto_imagenes SET ?', imageData, (err) => {
                    if (err) console.log('Error inserting product images', err);
                });
            });
        }

        res.status(200).json({ message: 'Product added successfully!' });
    });
});


app.get('/carrito/data', isAuthenticated, (req, res) => {
    const usuario_id = req.session.user.id;

    const query = `
        SELECT p.nombre, cp.cantidad, p.precio
        FROM carrito_productos cp
        JOIN productos p ON cp.producto_id = p.id
        WHERE cp.carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?)
    `;

    db.query(query, [usuario_id], (err, result) => {
        if (err) {
            console.error('Error fetching cart data:', err);
            return res.status(500).json({ error: 'Error fetching cart data.' });
        }
        res.json(result);
    });
});
 


app.get('/api/pedido/confirmacion', isAuthenticated, (req, res) => {
    const { pedido_id } = req.query;
    const usuario_id = req.session.user.id; // Obtener el usuario autenticado

    if (!pedido_id) {
        return res.status(400).json({ error: "No se proporcionó un pedido_id." });
    }

    // Consulta para verificar que el pedido pertenece al usuario autenticado
    const sqlPedido = `
        SELECT p.id, p.total, u.nombre AS usuario
        FROM pedidos p
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.id = ? AND p.usuario_id = ?
    `;

    const sqlProductos = `
        SELECT dp.cantidad, dp.precio_unitario, pr.nombre,
               (dp.cantidad * dp.precio_unitario) AS precio_total
        FROM detalle_pedido dp
        JOIN productos pr ON dp.producto_id = pr.id
        WHERE dp.pedido_id = ?
    `;

    db.query(sqlPedido, [pedido_id, usuario_id], (err, pedidos) => {
        if (err) {
            console.error("Error al obtener el pedido:", err);
            return res.status(500).json({ error: "Error al cargar el pedido." });
        }

        if (pedidos.length === 0) {
            return res.status(403).json({ error: "No tienes permiso para ver este pedido." });
        }

        const pedido = pedidos[0];
        db.query(sqlProductos, [pedido_id], (err, productos) => {
            if (err) {
                console.error("Error al obtener los productos del pedido:", err);
                return res.status(500).json({ error: "Error al cargar los productos." });
            }

            res.json({
                usuario: pedido.usuario,
                total: pedido.total,
                productos
            });
        });
    });
});

require('dotenv').config();
app.get('/config', (req, res) => {
    res.json({ stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
});
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Reemplaza con tu clave secreta de Stripe

app.post('/procesar-pago', isAuthenticated, async (req, res) => {
    const usuario_id = req.session.user.id;
    const { payment_method, token } = req.body;

    try {
        // Obtener los productos del carrito
        const queryCarrito = `
            SELECT cp.producto_id, cp.cantidad, p.precio
            FROM carrito_productos cp
            JOIN productos p ON cp.producto_id = p.id
            WHERE cp.carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?)
        `;

        db.query(queryCarrito, [usuario_id], async (err, carrito) => {
            if (err) {
                console.error('Error fetching cart data:', err);
                return res.status(500).send('Error al procesar el pago.');
            }

            // Calcular el total
            let total = 0;
            const detalles = carrito.map(item => {
                total += item.precio * item.cantidad;
                return [null, item.producto_id, item.cantidad, item.precio];
            });

            // Crear el pedido
            const queryPedido = 'INSERT INTO pedidos (usuario_id, total, estado) VALUES (?, ?, ?)';
            db.query(queryPedido, [usuario_id, total, 'pendiente'], (err, result) => {
                if (err) {
                    console.error('Error creating order:', err);
                    return res.status(500).send('Error al crear el pedido.');
                }

                const pedido_id = result.insertId;

                // Insertar detalles del pedido
                const queryDetalles = `
                    INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
                    VALUES ?
                `;
                detalles.forEach(d => (d[0] = pedido_id)); // Asignar pedido_id a cada detalle
                db.query(queryDetalles, [detalles], (err) => {
                    if (err) {
                        console.error('Error inserting order details:', err);
                        return res.status(500).send('Error al agregar los detalles del pedido.');
                    }

                    // Vaciar carrito
                    const queryVaciar = `
                        DELETE FROM carrito_productos WHERE carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?)
                    `;
                    db.query(queryVaciar, [usuario_id], async (err) => {
                        if (err) {
                            console.error('Error clearing cart:', err);
                            return res.status(500).send('Error al vaciar el carrito.');
                        }

                        // Procesar el pago con Stripe
                        const charge = await stripe.charges.create({
                            amount: total * 100, // Convertir a centavos
                            currency: 'usd', // Cambia a la moneda que necesites
                            source: token, // El token de Stripe
                            description: `Pedido de usuario ${usuario_id}`,
                        });
                        

                        if (charge.status === 'succeeded') {
                            res.json({ success: true, pedido_id: pedido_id });
                        } else {
                            res.status(500).json({ error: 'Pago fallido' });
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error procesando pago:', error);
        res.status(500).json({ error: 'Hubo un error al procesar el pago.' });
    }
});
