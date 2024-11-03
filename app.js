const express = require('express');
const mysql = require('mysql');
const path = require('path');

const app = express();

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'js_electronics'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
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


