/**
 * @swagger
 * components:
 *   schemas:
 *     Ocorrencia:
 *       type: object
 *       required:
 *         - titulo
 *         - localizacao
 *         - descricao
 *       properties:
 *         id:
 *           type: string
 *           description: ID da ocorrência
 *         titulo:
 *           type: string
 *           description: Título da ocorrência
 *         localizacao:
 *           type: string
 *           description: Localização da ocorrência
 *         descricao:
 *           type: string
 *           description: Descrição da ocorrência
 *         imagem:
 *           type: string
 *           description: URL ou base64 da imagem
 *         criadoEm:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 */

/**
 * @swagger
 * /api/ocorrencias:
 *   post:
 *     summary: Criar uma nova ocorrência
 *     tags: [Ocorrencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ocorrencia'
 *     responses:
 *       201:
 *         description: Ocorrência criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ocorrencia'
 */

/**
 * @swagger
 * /api/ocorrencias:
 *   get:
 *     summary: Listar todas as ocorrências
 *     tags: [Ocorrencias]
 *     responses:
 *       200:
 *         description: Lista de ocorrências
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ocorrencia'
 */

/**
 * @swagger
 * /api/ocorrencias/{id}:
 *   put:
 *     summary: Atualizar uma ocorrência pelo ID
 *     tags: [Ocorrencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da ocorrência
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ocorrencia'
 *     responses:
 *       200:
 *         description: Ocorrência atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ocorrencia'
 */

/**
 * @swagger
 * /api/ocorrencias/{id}:
 *   delete:
 *     summary: Deletar uma ocorrência pelo ID
 *     tags: [Ocorrencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da ocorrência
 *     responses:
 *       200:
 *         description: Ocorrência deletada
 */

const express = require('express');
const router = express.Router();
const Ocorrencia = require('../models/Ocorrencia');

// CRIAR
router.post('/', async (req, res) => {
    try {
        const ocorrencia = new Ocorrencia(req.body);
        await ocorrencia.save();
        res.status(201).json(ocorrencia);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// LISTAR TODAS
router.get('/', async (req, res) => {
    try {
        const ocorrencias = await Ocorrencia.find();
        res.json(ocorrencias);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ATUALIZAR
router.put('/:id', async (req, res) => {
    try {
        const ocorrencia = await Ocorrencia.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(ocorrencia);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// DELETAR
router.delete('/:id', async (req, res) => {
    try {
        await Ocorrencia.findByIdAndDelete(req.params.id);
        res.json({ mensagem: 'Ocorrência deletada' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;