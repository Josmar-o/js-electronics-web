ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY 'password'; 
FLUSH PRIVILEGES;

SELECT user, host, plugin FROM mysql.user WHERE user = 'root';
SELECT user, host, plugin FROM mysql.user WHERE user = 'admin-js';

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
    categoria,
    marca,
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
     'Oficina',
     'Lenovo',
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
     'Oficina',
     'Lenovo',
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
     'Oficina',
     'Lenovo',
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
     'Oficina',
     'Lenovo',
     '2021-01-15');


INSERT INTO producto_imagenes (producto_id, imagen_url)
VALUES 
    (1, 'https://p3-ofp.static.pub/fes/cms/2022/03/18/j4c5s3whya7h03txfx2gb0fb39q1k7129564.png'),
    (2, 'https://www.cnet.com/a/img/resize/39f8b5e130434d0d9768198e713fcdd0d63b0623/hub/2011/03/10/bb2c1f3a-67c3-11e3-a665-14feb5ca9861/34526813_OVR.png?auto=webp&width=1200'),
    (3, 'https://it-support-malaysia.com/wp-content/uploads/2019/03/thinkpad-tp-l380.png'),
    (4, 'https://p1-ofp.static.pub/fes/cms/2022/03/21/uxtnwuszmkyvzz1zyq6lwh3ln4dt8u549469.png');

    



INSERT INTO blog (titulo, contenido, fecha_publicacion, imagen_url) VALUES 
('Lanzamiento de la nueva ThinkPad T14 G2', 
 'La nueva ThinkPad T14 G2 ha sido lanzada al mercado, y promete ofrecer mejoras significativas en rendimiento y duración de batería. 
 Esta laptop está diseñada para satisfacer las necesidades de los profesionales que requieren un dispositivo robusto y fiable. 
 Con un procesador Intel Core i7 de última generación y una tarjeta gráfica dedicada, los usuarios pueden esperar una experiencia 
 de uso fluida, ya sea para tareas de oficina o aplicaciones más exigentes. Además, la T14 G2 incluye un teclado retroiluminado y 
 características de seguridad avanzadas, como un lector de huellas dactilares, garantizando que tu información esté siempre protegida.',
 NOW(),
 '/public/img/image.png'),

('Consejos para elegir la laptop adecuada', 
 'Elegir la laptop adecuada puede ser un desafío, dado el amplio rango de opciones disponibles en el mercado. 
 Es importante evaluar tus necesidades específicas: ¿la usarás para trabajo, estudio o gaming? Asegúrate de considerar 
 características clave como el tipo de procesador, la cantidad de memoria RAM, la capacidad de almacenamiento y la duración de la batería. 
 También es recomendable leer opiniones y comparativas para tomar una decisión informada. Recuerda que invertir en una buena laptop puede 
 mejorar tu productividad y ofrecer una experiencia más satisfactoria.',
 NOW(),
 '/public/img/image.png'),

('Actualizaciones de software para tu laptop', 
 'Mantener tu laptop actualizada es crucial para garantizar su funcionamiento óptimo y su seguridad. Las actualizaciones de software 
 no solo mejoran el rendimiento del sistema operativo, sino que también corrigen vulnerabilidades de seguridad que podrían ser 
 explotadas por malware. Asegúrate de activar las actualizaciones automáticas y revisa regularmente si hay nuevas versiones de 
 software disponibles. Recuerda también actualizar tus aplicaciones para aprovechar las últimas funciones y mejoras.',
 NOW(),
 '/public/img/image.png'),

('Mejores prácticas para el cuidado de laptops', 
 'Cuidar adecuadamente tu laptop puede extender su vida útil y mantener su rendimiento. Aquí te compartimos algunas mejores 
 prácticas: evita sobrecalentamientos utilizando la laptop en superficies duras, limpia regularmente el teclado y la pantalla, 
 y utiliza un protector para evitar caídas. También es importante desconectar los dispositivos externos cuando no se usen y 
 evitar dejar la laptop expuesta a la luz solar directa. Con un poco de cuidado, podrás disfrutar de tu laptop durante mucho más tiempo.',
 NOW(),
 '/public/img/image.png'),

('Novedades en el mundo de la tecnología', 
 'El mundo de la tecnología avanza a pasos agigantados, y es importante mantenerse informado sobre las últimas tendencias. 
 Desde innovaciones en inteligencia artificial hasta avances en computación cuántica, la tecnología está cambiando la forma en 
 que vivimos y trabajamos. Este año, hemos visto el auge de dispositivos híbridos, que combinan lo mejor de las laptops y las tabletas, 
 ofreciendo versatilidad y rendimiento. Además, los desarrollos en conectividad 5G están transformando la manera en que 
 interactuamos con el mundo digital. Mantente al día con estas novedades para no quedarte atrás.',
 NOW(),
 '/public/img/image.png');


UPDATE usuarios SET is_admin = TRUE WHERE id = 1;

