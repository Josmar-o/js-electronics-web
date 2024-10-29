ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY 'password'; 
FLUSH PRIVILEGES;
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';




INSERT INTO productos (
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
    fecha_lanzamiento
)
VALUES 
    ('Lenovo ThinkPad T14 G2', 
     'Laptop empresarial Lenovo ThinkPad T14 G2 con durabilidad y seguridad mejorada.', 
     'Intel Core i7-1165G7', 
     '16GB', 
     '512GB', 
     'SSD', 
     1299.99, 
     10, 
     '14 pulgadas', 
     '1920 x 1080', 
     'Windows 10 Pro', 
     'Integrated Intel Iris Xe', 
     1.5, 
     '32.4 x 22.5 x 1.8 cm', 
     '12', 
     '2021-05-01'),

    ('Lenovo ThinkPad X220', 
     'Laptop portátil Lenovo ThinkPad X220, ideal para profesionales en movimiento.', 
     'Intel Core i5-2520M', 
     '8GB', 
     '256GB', 
     'SSD', 
     399.99, 
     15, 
     '12.5 pulgadas', 
     '1366 x 768', 
     'Windows 10 Pro', 
     'Integrated Intel HD Graphics 3000', 
     1.4, 
     '30.1 x 20.0 x 2.1 cm', 
     '12', 
     '2012-02-01'),

    ('Lenovo ThinkPad L380', 
     'Laptop Lenovo ThinkPad L380, diseñada para facilitar la productividad en cualquier lugar.', 
     'Intel Core i5-8250U', 
     '8GB', 
     '512GB', 
     'SSD', 
     599.99, 
     20, 
     '13.3 pulgadas', 
     '1920 x 1080', 
     'Windows 10 Pro', 
     'Integrated Intel UHD Graphics 620', 
     1.3, 
     '32.0 x 22.0 x 1.9 cm', 
     '12', 
     '2018-06-01'),

    ('Lenovo ThinkPad P1 Gen 4', 
     'Laptop Lenovo ThinkPad P1 Gen 4, potente estación de trabajo con gráficos profesionales.', 
     'Intel Core i7-10850H', 
     '16GB', 
     '1TB', 
     'SSD', 
     1999.99, 
     5, 
     '15.6 pulgadas', 
     '1920 x 1080', 
     'Windows 10 Pro', 
     'NVIDIA GeForce GTX 1650', 
     1.5, 
     '35.4 x 24.1 x 1.9 cm', 
     '12', 
     '2021-01-15');


INSERT INTO producto_imagenes (producto_id, imagen_url)
VALUES 
    (1, '/img_laptops/laptop.png'),


select * from productos p 

DELETE FROM productos
WHERE nombre = 'Lenovo ThinkPad X220';