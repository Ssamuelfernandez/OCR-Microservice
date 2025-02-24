import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import tesseract from 'tesseract.js';
import multer from 'multer';

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const uploadDir = path.join(__dirname, '/tmp/');

// Verificar si la carpeta 'uploads' existe, si no, crearla
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📂 Carpeta creada.');
}

// Configuración de Multer para guardar archivos en 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    console.log(`📸 Guardando imagen como: ${uniqueName}`);
    cb(null, uniqueName);
  },
});

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
    let results = [];

    // Procesar cada imagen subida
    for (const file of req.files) {
      const imagePath = file.path;
      console.log('✅ Imagen guardada en:', imagePath);

      try {
        const { data: { text } } = await tesseract.recognize(imagePath, 'eng+spa');
        // Limpiar y formatear el texto extraído
        const textoLimpio = limpiarTextoOCR(text);
        results.push({ file: file.originalname, text: textoLimpio });
        console.log(`📄 Texto extraído de ${file.originalname}:`, textoLimpio);
      } catch (err) {
        console.error(`❌ Error al procesar la imagen ${file.originalname}:`, err);
        results.push({ file: file.originalname, error: 'Error al procesar la imagen' });
      } finally {
        // Eliminar el archivo de la carpeta "uploads" después de procesarlo
        fs.unlink(imagePath, (err) => {
          if (err) console.error(`Error eliminando el archivo ${imagePath}:`, err);
          else console.log(`🗑️ Archivo eliminado: ${imagePath}`);
        });
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