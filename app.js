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
app.use('/img_laptops', express.static(path.join(__dirname, 'img_laptops')));

// Fetch products from the database
app.get('/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';
    
    db.query(sql, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
});

// Serve your HTML file (for the catalog page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/html/catalog.html')); // Make sure you have the HTML file
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
