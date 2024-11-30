const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session'); // Importar express-session
const bcrypt = require('bcrypt'); // Importar for password hashing
const validator = require('validator');
const multer = require('multer');
const Stripe = require('stripe');
const router = express.Router();
require('dotenv').config();


const app = express();

app.use(session({
    secret: 'my_development_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Session expiry: 1 dia
}));



// MySQL connection setup
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
    
});

db.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

app.use(express.json()); // To handle JSON in request body
app.use(express.urlencoded({ extended: true })); // To handle form data

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
                        isAdmin: user.is_admin
                    };

                    // Redirigir al dashboard o página HTML según el rol del usuario
                    if (user.is_admin) {
                        // Redirigi a la página de administrador
                        res.json({ success: true, redirectUrl: '/admin/dashboard.html' });
                    } else {
                        // Redigi a la página de usuario
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



// Function to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
        
    } else {
        res.status(401).json({ message: 'No Autorizado' });
    }
}

// Ruta para verificar autenticación
app.get('/isLoggedIn', (req, res) => {
    if (req.session.user) {
        res.json({ logged_in: true });
    } else {
        res.json({ logged_in: false });
    }
});
app.get('/mis-pedidos', (req, res) => {
    // Verificar si el usuario está autenticado
    if (req.session.user) {
        const userId = req.session.user.id; // Obtener el ID del usuario de la sesión

        // Consulta SQL para obtener los pedidos del usuario
        const query = `
            SELECT p.id AS pedido_id, p.total, p.fecha_pedido, p.estado, dp.cantidad, dp.precio_unitario, pr.nombre AS producto
            FROM pedidos p
            JOIN detalle_pedido dp ON p.id = dp.pedido_id
            JOIN productos pr ON dp.producto_id = pr.id
            WHERE p.usuario_id = ?`;
        
        db.query(query, [userId], (err, result) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).send('Error al obtener los pedidos');
            }
            
            // Responder con los pedidos en formato JSON
            res.json({ pedidos: result });
        });
    } else {
        // Si el usuario no está autenticado, redirigir al login
        res.redirect('/html/login.html');
    }
});

// Add a product to the cart
app.post('/carrito/add', isAuthenticated, (req, res) => {
    const producto_id = req.body.productValue;
    const cantidad = 1; // Por defecto, se agrega 1 unidad
    const usuario_id = req.session.user.id;

    const sqlCarritoCheck = 'SELECT id FROM carrito WHERE usuario_id = ?';
    const sqlCarritoCreate = 'INSERT INTO carrito (usuario_id) VALUES (?)';
    const sqlCheckProduct = 'SELECT * FROM carrito_productos WHERE carrito_id = ? AND producto_id = ?';
    const sqlInsertProduct = 'INSERT INTO carrito_productos (carrito_id, producto_id, cantidad) VALUES (?, ?, ?)';
    const sqlUpdateProduct = 'UPDATE carrito_productos SET cantidad = cantidad + ? WHERE carrito_id = ? AND producto_id = ?';
    const sqlGetStock = 'SELECT stock FROM productos WHERE id = ?';

    db.query(sqlGetStock, [producto_id], (err, stockResult) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener el stock del producto' });
        }

        const stock = stockResult[0]?.stock || 0; // Obtener el stock del producto

        if (stock <= 0) {
            return res.status(400).json({ success: false, message: 'El producto no tiene stock disponible.' });
        }

        // Verificar si el carrito ya existe
        db.query(sqlCarritoCheck, [usuario_id], (err, carritoResult) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Error al verificar el carrito' });
            }

            let carrito_id;

            if (carritoResult.length > 0) {
                carrito_id = carritoResult[0].id; // Carrito ya existe
                addProductToCarrito(carrito_id);
            } else {
                // Crear un nuevo carrito si no existe
                db.query(sqlCarritoCreate, [usuario_id], (err, createResult) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, message: 'Error al crear el carrito' });
                    }
                    carrito_id = createResult.insertId;
                    addProductToCarrito(carrito_id);
                });
            }

            // Función para agregar producto al carrito
            function addProductToCarrito(carrito_id) {
                db.query(sqlCheckProduct, [carrito_id, producto_id], (err, productResult) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ success: false, message: 'Error al verificar el producto en el carrito' });
                    }

                    const cantidadActual = productResult[0]?.cantidad || 0; // Cantidad actual en el carrito

                    if (cantidadActual + cantidad > stock) {
                        return res.status(400).json({
                            success: false,
                            message: `No puedes agregar más de del stock (${stock}) que estan disponibles de este producto.`,
                        });
                    }

                    if (productResult.length > 0) {
                        // Actualizar la cantidad del producto en el carrito
                        db.query(sqlUpdateProduct, [cantidad, carrito_id, producto_id], (err) => {
                            if (err) {
                                console.error('Database error:', err);
                                return res.status(500).json({ success: false, message: 'Error al actualizar la cantidad del producto' });
                            }
                            res.json({ success: true, message: 'Producto actualizado en el carrito' });
                        });
                    } else {
                        // Insertar un nuevo producto en el carrito
                        db.query(sqlInsertProduct, [carrito_id, producto_id, cantidad], (err) => {
                            if (err) {
                                console.error('Database error:', err);
                                return res.status(500).json({ success: false, message: 'Error al agregar el producto al carrito' });
                            }
                            res.json({ success: true, message: 'Producto agregado al carrito' });
                        });
                    }
                });
            }
        });
    });
});




//Ver carrito

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

app.post('/carrito/increase', isAuthenticated, (req, res) => {
    const { producto_id } = req.body;
    const usuario_id = req.session.user.id;

    const sqlGetStock = 'SELECT stock FROM productos WHERE id = ?';
    const sqlGetQuantity = `
        SELECT cantidad FROM carrito_productos 
        WHERE carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?) 
        AND producto_id = ?`;
    const sqlUpdateQuantity = `
        UPDATE carrito_productos
        SET cantidad = cantidad + 1
        WHERE carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?) AND producto_id = ?`;

    // Obtener el stock del producto
    db.query(sqlGetStock, [producto_id], (err, stockResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error al obtener el stock.' });
        }
        const stock = stockResult[0]?.stock || 0;

        // Obtener la cantidad actual en el carrito
        db.query(sqlGetQuantity, [usuario_id, producto_id], (err, quantityResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Error al obtener la cantidad.' });
            }
            const cantidadActual = quantityResult[0]?.cantidad || 0;

            if (cantidadActual < stock) {
                // Actualizar la cantidad si no supera el stock
                db.query(sqlUpdateQuantity, [usuario_id, producto_id], (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, message: 'Error al actualizar la cantidad.' });
                    }
                    res.json({ success: true, message: 'Cantidad actualizada.' });
                });
            } else {
                res.json({ success: false, message: 'No puedes agregar más de lo disponible en stock.' });
            }
        });
    });
});



app.post('/carrito/decrease', (req, res) => {
    const producto_id = req.body.producto_id;
    const usuario_id = req.session.user.id;

    db.query(`
        UPDATE carrito_productos
        SET cantidad = cantidad - 1
        WHERE carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?) AND producto_id = ?
        AND cantidad > 1`, [usuario_id, producto_id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Error al actualizar la cantidad.' });
            }
            res.json({ success: true, message: 'Cantidad actualizada.' });
        });
});

app.post('/carrito/delete', (req, res) => {
    const producto_id = req.body.producto_id;
    const usuario_id = req.session.user.id;

    db.query(`
        DELETE FROM carrito_productos
        WHERE carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?) AND producto_id = ?`, 
        [usuario_id, producto_id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Error al eliminar el producto.' });
            }
            res.json({ success: true, message: 'Producto eliminado.' });
        });
});





// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});




app.post('/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Validación de la contraseña (mínimo 8 caracteres, al menos una letra y un número)
    if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // Al menos una letra y un número
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres, incluyendo una letra y un número.' });
    }

    // Validación del correo electrónico
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Dirección de correo electrónico no válida.' });
    }

    // Hashing de la contraseña
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Error al cifrar la contraseña' });

        const sql = 'INSERT INTO usuarios (nombre, apellido, email, contrasena) VALUES (?, ?, ?, ?)';
        db.query(sql, [firstName, lastName, email, hash], (err, result) => {
            if (err) return res.status(500).json({ error: 'Error en la base de datos' });
            res.json({ success: true, message: 'Registro exitoso' });
        });
    });
});

// Ruta para obtener los detalles del usuario actual
app.get('/perfil', (req, res) => {
    // Verificar si el usuario está autenticado
    if (req.session.user) {
        const userId = req.session.user.id; // Obtener el ID del usuario de la sesión

        // Consulta para obtener los detalles del usuario
        const query = 'SELECT * FROM usuarios WHERE id = ?';
        db.query(query, [userId], (err, results) => {
            if (err) {
                console.error('Error al obtener los datos del usuario: ', err);
                return res.status(500).send('Error en el servidor');
            }

            if (results.length === 0) {
                return res.status(404).send('Usuario no encontrado');
            }

            // Enviar los datos del usuario
            res.json(results[0]);
        });
    } else {
        // Si el usuario no está autenticado, enviar un error 401
        return res.status(401).json({ message: 'No Autorizado' });
    }
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


app.get('/productos', (req, res) => {
    const { search, minPrice, maxPrice, ram, procesador, marca, tipo_almacenamiento, categoria, rom, tamano_pantalla, resolucion_pantalla, sistema_operativo } = req.query;
    let sql = `
        SELECT *, 
        (SELECT producto_imagenes.imagen_url FROM producto_imagenes WHERE producto_imagenes.producto_id = productos.id LIMIT 1) AS imagen_url 
        FROM productos 
        WHERE 1=1
    `;

    const params = [];

    // Agregar filtros dinámicamente
    if (search) {
        sql += ` AND (productos.nombre LIKE ? OR productos.descripcion LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }
    if (minPrice) {
        sql += ` AND productos.precio >= ?`;
        params.push(minPrice);
    }
    if (maxPrice) {
        sql += ` AND productos.precio <= ?`;
        params.push(maxPrice);
    }
    if (ram) {
        sql += ` AND productos.ram = ?`;
        params.push(ram);
    }
    if (procesador) {
        sql += ` AND productos.procesador LIKE ?`;
        params.push(`%${procesador}%`);
    }
    if (marca) {
        sql += ` AND productos.marca = ?`;
        params.push(marca);
    }
    if (tipo_almacenamiento) {
        sql += ` AND productos.tipo_almacenamiento = ?`;
        params.push(tipo_almacenamiento);
    }
    if (categoria) {
        sql += ` AND productos.categoria = ?`;
        params.push(categoria);
    }
    if (rom) {
        sql += ` AND productos.rom = ?`;
        params.push(rom);
    }
    if (tamano_pantalla) {
        sql += ` AND productos.tamano_pantalla = ?`;
        params.push(tamano_pantalla);
    }
    if (resolucion_pantalla) {
        sql += ` AND productos.resolucion_pantalla = ?`;
        params.push(resolucion_pantalla);
    }
    if (sistema_operativo) {
        sql += ` AND productos.sistema_operativo = ?`;
        params.push(sistema_operativo);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Ver un producto específico segun id
app.get('/productos/:id', (req, res) => {
    const productId = req.params.id;
    const sql = `
        SELECT *, 
        (SELECT producto_imagenes.imagen_url FROM producto_imagenes WHERE producto_imagenes.producto_id = productos.id LIMIT 1) AS imagen_url 
        FROM productos 
        WHERE id = ?;`; 

    db.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.length > 0) {
            res.json(result[0]); 
        } else {
            res.status(404).json({ error: 'Product not found' }); 
        }
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
app.post('/agregar-blog', (req, res) => {
    console.log(req.body); // Esto mostrará los datos enviados por el formulario
    const { titulo, contenido, imagen_url } = req.body;
  
    if (!titulo || !contenido) {
      return res.status(400).send('Título y contenido son obligatorios');
    }
    if (contenido.length > 660) {
        return res.status(400).json({ message: 'El contenido no puede exceder los 660 caracteres.' });
    }
  
    const query = `INSERT INTO blog (titulo, contenido, imagen_url) VALUES (?, ?, ?)`;
    db.query(query, [titulo, contenido, imagen_url || null], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error al agregar el blog');
      }
      res.status(200).send('Blog agregado exitosamente');
    });
  });
  

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/html/home.html')); 
});



app.get('/get-session-info', (req, res) => {
    if (req.session.user) {
        res.json({ is_admin: req.session.user.isAdmin });  
    } else {
        res.json({ is_admin: false });
    }
});


// Funcion para verificar si el usuario es administrador
function isAdmin(req, res, next) {
    
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    } else {
        return res.status(403).json({ message: "Acceso denegado. Solo administradores pueden acceder a esta ruta." });
    }
}

app.use('/admin', isAdmin, express.static(path.join(__dirname, 'admin')));

app.post('/add-product', isAuthenticated, (req, res) => {
    const {
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
        fecha_lanzamiento,
        imagenes_url // Agregar URLs como parte del request body
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !descripcion || !procesador || !ram || !rom || !tipo_almacenamiento || !precio || !stock || !tamano_pantalla || !resolucion_pantalla || !sistema_operativo || !tarjeta_grafica || !peso || !dimensiones || !garantia_meses || !categoria || !marca || !fecha_lanzamiento || !imagenes_url) {
        return res.status(400).json({ message: 'Por favor, llena todos los campos.' });
    }
    if (descripcion.length > 660) {
        return res.status(400).json({ message: 'La descripción no puede exceder los 660 caracteres.' });
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

    // Insertar producto en la base de datos
    const query = 'INSERT INTO productos SET ?';
    db.query(query, productData, (err, result) => {
        if (err) {
            console.error('Error inserting product:', err);
            return res.status(500).json({ message: 'Error insertando el producto en la base de datos.' });
        }

        const productId = result.insertId;

        // Insertar URLs de imágenes asociadas
        const urls = imagenes_url.split(',').map(url => url.trim());
        const insertImageQuery = 'INSERT INTO producto_imagenes (producto_id, imagen_url) VALUES ?';
        const imageValues = urls.map(url => [productId, url]);

        db.query(insertImageQuery, [imageValues], (err) => {
            if (err) {
                console.error('Error inserting product images:', err);
                return res.status(500).json({ message: 'Error insertando las URLs de las imágenes.' });
            }

            res.status(200).json({ success: true });
        });
    });
});

// Ruta para obtener los pedidos
app.get('/pedidos', (req, res) => {
    const query = `
        SELECT 
            u.nombre AS usuario_nombre, 
            u.email AS usuario_correo, 
            p.id AS pedido_id, 
            p.total, 
            p.fecha_pedido, 
            p.estado, 
            dp.producto_id, 
            dp.cantidad, 
            dp.precio_unitario,
            pr.nombre AS producto_nombre
        FROM pedidos p
        JOIN usuarios u ON p.usuario_id = u.id
        JOIN detalle_pedido dp ON dp.pedido_id = p.id
        JOIN productos pr ON dp.producto_id = pr.id
        ORDER BY p.fecha_pedido DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al obtener los pedidos.');
        }

        // Agrupa los pedidos por usuario y pedido
        const pedidos = results.reduce((acc, row) => {
            const { usuario_nombre, usuario_correo, pedido_id, total, fecha_pedido, estado, producto_id, cantidad, precio_unitario, producto_nombre } = row;
            
            if (!acc[pedido_id]) {
                acc[pedido_id] = {
                    usuario: { nombre: usuario_nombre, correo: usuario_correo },
                    id: pedido_id,
                    total,
                    fecha_pedido,
                    estado,
                    productos: []
                };
            }

            acc[pedido_id].productos.push({
                producto_id, 
                nombre: producto_nombre,  
                cantidad, 
                precio_unitario
            });
            return acc;
        }, {});

        res.json(Object.values(pedidos));
    });
});


app.post('/pedidos/:id/estado', (req, res) => {
    const pedidoId = req.params.id;
    const nuevoEstado = req.body.estado;

    const query = `
        UPDATE pedidos
        SET estado = ?
        WHERE id = ?;
    `;

    db.query(query, [nuevoEstado, pedidoId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al actualizar el estado' });
        }

        res.json({ message: 'Estado actualizado correctamente' });
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


app.get('/config', (req, res) => {
    res.json({ stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
});
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); 

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
