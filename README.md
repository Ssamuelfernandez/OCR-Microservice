
# OCR Microservice

Este proyecto es un microservicio OCR desarrollado en Node.js que permite extraer y limpiar texto a partir de imágenes. 

Utiliza Express para el servidor, Multer para la subida de archivos, y Tesseract.js para la extracción de texto en inglés y español. Además, implementa una función para limpiar y formatear el texto extraído y elimina automáticamente los archivos subidos una vez procesados.



## Características

- Subida de Archivos:   
    Permite subir hasta 3 imágenes por petición y valida que los archivos sean imágenes.
- Extracción de Texto:  
    Utiliza Tesseract.js configurado para reconocer textos en inglés y español.
- Limpieza y Formateo:  
    Implementa una función para limpiar y formatear el texto extraído, eliminando saltos de línea innecesarios, espacios redundantes y caracteres extraños.

- Gestión de Archivos Temporales:   
    Una vez procesada cada imagen, el archivo se elimina automáticamente de la carpeta uploads.


## Tecnologías Utilizadas

- Node.js (ES Modules)
- Express: Servidor web.
- Multer: Manejo de subida de archivos.
- Tesseract.js: Extracción de texto (OCR).
- JavaScript (ES6+)

## Instalación y Ejecución

1. Clona el repositorio:

```bash
  git clone https://github.com/Ssamuelfernandez/OCR-Microservice.git

  cd OCR-Microservice
```

2. Instala las dependencias:

```bash
  npm install
```

3. Inicia el servidor:

```bash
  npm start
```

El servidor se ejecutará en http://localhost:3000.


    
## Uso de la API

**Endpoint: `POST /ocr`**

- **Descripción:**
Recibe hasta 3 imágenes en una sola petición, extrae el texto de cada una y devuelve un JSON con los resultados.

- **Parámetros (form-data):**

    `images` (File): Imagen (o imágenes) a procesar.    
        Nota: Puedes subir hasta 3 archivos por petición.

- **Ejemplo de solicitud con Postman:**

    1. Selecciona el método `POST`.   

    2. URL: `http://localhost:3000/ocr`

    3. En la pestaña Body, selecciona `form-data` y añade el campo `images` (tipo **File**) para cada imagen.
    
    4. Envía la petición.

- **Respuesta Ejemplo:**
```
[
  {
    "file": "nombre-de-la-imagen.jpg",
    "text": "Texto extraído y formateado de la imagen."
  },
  {
    "file": "otra-imagen.png",
    "text": "Otro texto extraído."
  }
]
```



