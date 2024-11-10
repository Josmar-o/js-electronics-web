const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session'); // Import express-session
const bcrypt = require('bcrypt'); // Install bcrypt for password hashing

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
                        nombre: user.nombre
                    };
                    // Send JSON response for success
                    res.json({ success: true, message: 'Login successful' });
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
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.json({ message: `Welcome, ${req.session.user.nombre}` });
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
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Error hashing password' });
        
        const sql = 'INSERT INTO usuarios (nombre, apellido, email, contrasena) VALUES (?, ?, ?, ?)';
        db.query(sql, [firstName, lastName, email, hash], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'User registered successfully' });
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




// Route to add an item to the cart
app.post('/carrito', (req, res) => {
    const { usuario_id, producto_id, cantidad } = req.body;
    const sqlCheck = 'SELECT * FROM carrito_productos WHERE carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?) AND producto_id = ?';
    const sqlInsert = 'INSERT INTO carrito_productos (carrito_id, producto_id, cantidad) VALUES ((SELECT id FROM carrito WHERE usuario_id = ?), ?, ?)';
    const sqlUpdate = 'UPDATE carrito_productos SET cantidad = cantidad + ? WHERE carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?) AND producto_id = ?';

    db.query(sqlCheck, [usuario_id, producto_id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.length > 0) {
            db.query(sqlUpdate, [cantidad, usuario_id, producto_id], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Quantity updated successfully' });
            });
        } else {
            db.query(sqlInsert, [usuario_id, producto_id, cantidad], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Item added to cart successfully' });
            });
        }
    });
});

// Route to modify the quantity of an item in the cart
app.put('/carrito', (req, res) => {
    const { usuario_id, producto_id, cantidad } = req.body;
    const sqlUpdate = 'UPDATE carrito_productos SET cantidad = ? WHERE carrito_id = (SELECT id FROM carrito WHERE usuario_id = ?) AND producto_id = ?';

    db.query(sqlUpdate, [cantidad, usuario_id, producto_id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Quantity updated successfully' });
    });
});