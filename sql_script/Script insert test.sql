USE js_electronics;
INSERT INTO productos (nombre, descripcion, procesador, ram, rom, tipo_almacenamiento, precio, stock, imagen_url)
VALUES 
	(    'Lenovo ThinkPad T14 G2', 
    'Laptop empresarial Lenovo ThinkPad T14 G2 con durabilidad y seguridad mejorada.', 
    'Intel Core i7-1165G7', 
    '16GB', 
    '512GB', 
    'SSD', 
    1299.99, 
    10, 
    '/img_laptops/laptop.png'),
    
    ('Lenovo ThinkPad X220', 
     'Laptop portátil Lenovo ThinkPad X220, ideal para profesionales en movimiento.', 
     'Intel Core i5-2520M', 
     '8GB', 
     '256GB', 
     'SSD', 
     399.99, 
     15, 
     '/img_laptops/laptop.png'),

    ('Lenovo ThinkPad L380', 
     'Laptop Lenovo ThinkPad L380, diseñada para facilitar la productividad en cualquier lugar.', 
     'Intel Core i5-8250U', 
     '8GB', 
     '512GB', 
     'SSD', 
     599.99, 
     20, 
     '/img_laptops/laptop.png'),

    ('Lenovo ThinkPad P1 Gen 4', 
     'Laptop Lenovo ThinkPad P1 Gen 4, potente estación de trabajo con gráficos profesionales.', 
     'Intel Core i7-10850H', 
     '16GB', 
     '1TB', 
     'SSD', 
     1999.99, 
     5, 
     '/img_laptops/laptop.png');

select * from productos p 

DELETE FROM productos
WHERE nombre = 'Lenovo ThinkPad X220';