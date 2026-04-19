/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Enviar imagem para o bucket S3
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - arquivo
 *             properties:
 *               arquivo:
 *                 type: string
 *                 format: binary
 *               prefix:
 *                 type: string
 *                 description: Pasta no bucket (padrao ocorrencias)
 *     responses:
 *       201:
 *         description: Upload concluido
 *       400:
 *         description: Requisicao invalida
 */

const express = require('express');
const multer = require('multer');
const { uploadToS3 } = require('../services/s3');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Apenas arquivos de imagem sao permitidos.'));
      return;
    }
    cb(null, true);
  },
});

const router = express.Router();

router.post('/', (req, res, next) => {
  upload.single('arquivo')(req, res, (err) => {
    if (err) {
      const mensagem = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
        ? 'Arquivo maior que 5 MB.'
        : err.message;
      res.status(400).json({ erro: mensagem });
      return;
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ erro: 'Envie um arquivo no campo "arquivo" (multipart/form-data).' });
      return;
    }

    const prefix = typeof req.body.prefix === 'string' && req.body.prefix.trim()
      ? req.body.prefix.trim()
      : 'ocorrencias';

    const resultado = await uploadToS3({
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
      originalName: req.file.originalname,
      prefix,
    });

    res.status(201).json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message || 'Falha ao enviar para o S3.' });
  }
});

module.exports = router;
