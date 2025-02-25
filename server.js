import express from 'express';
import tesseract from 'tesseract.js';
import multer from 'multer';
import { createWorker } from 'tesseract.js';

const app = express();
const storage = multer.memoryStorage();

// Validación para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage,
  limits: { files: 3 },
  fileFilter,
});

// Función para limpiar y formatear el texto extraído
function limpiarTextoOCR(texto) {
  return texto
    .replace(/-\n/g, '')      // Une palabras cortadas por guión y salto de línea
    .replace(/\n/g, ' ')       // Reemplaza saltos de línea por espacios
    .replace(/\s+/g, ' ')      // Elimina espacios múltiples
    .trim();                  // Quita espacios al inicio y final
}

// Endpoint para procesar imágenes con OCR
app.post('/ocr', (req, res) => {
  upload.array('images', 3)(req, res, async function (err) {
    if (err) {
      // Captura errores como subir más de 3 imágenes u otros errores de Multer
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se han subido imágenes' });
    }

    const worker = await createWorker('eng+spa');
    let results = [];

    // Procesar cada imagen subida
    for (const file of req.files) {
      console.log('✅ Imagen recibida:', file.originalname);
      const image = file.buffer;
      try {

    //    const { data: { text } } = await tesseract.recognize(file.buffer, 'eng+spa');
          
          const { data: { text } } = await worker.recognize(image);


        // Limpiar y formatear el texto extraído
        const textoLimpio = limpiarTextoOCR(text);

        results.push({ file: file.originalname, text: textoLimpio });
        console.log(`📄 Texto extraído de ${file.originalname}:`, textoLimpio);


      } catch (err) {
        console.error(`❌ Error al procesar la imagen ${file.originalname}:`, err);
        results.push({ file: file.originalname, error: 'Error al procesar la imagen' });
      }
    }

    res.json(results);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor OCR corriendo en http://localhost:${PORT}`);
});

export default app;
