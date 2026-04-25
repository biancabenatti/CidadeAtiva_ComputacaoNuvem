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
const { imagemParaRespostaCliente } = require('../services/s3');
const {
    upsertImagemOcorrencia,
    getImagemPorOcorrenciaId,
    getImagensPorOcorrenciaIds,
    deleteImagemPorOcorrenciaId,
} = require('../database/relacional');

// CRIAR (imagem: URL no Mongo sempre que enviada; Postgres replica quando disponivel)
router.post('/', async (req, res) => {
    try {
        const { imagem, ...dadosOcorrencia } = req.body;
        const doc = { ...dadosOcorrencia };
        if (imagem) {
            doc.imagem = imagem;
        }

        const ocorrencia = new Ocorrencia(doc);
        await ocorrencia.save();

        if (imagem) {
            await upsertImagemOcorrencia(ocorrencia._id.toString(), imagem);
        }

        const criado = ocorrencia.toObject();
        criado.imagem = await imagemParaRespostaCliente(criado.imagem);
        res.status(201).json(criado);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
});

// LISTAR TODAS
router.get('/', async (req, res) => {
    try {
        const ocorrencias = await Ocorrencia.find();

        const ids = ocorrencias.map((item) => item._id.toString());
        const imagensMap = await getImagensPorOcorrenciaIds(ids);

        const ocorrenciasComImagem = await Promise.all(
            ocorrencias.map(async (item) => {
                const ocorrenciaObj = item.toObject();
                const idStr = ocorrenciaObj._id.toString();
                const raw = imagensMap[idStr] || ocorrenciaObj.imagem || null;
                return {
                    ...ocorrenciaObj,
                    imagem: await imagemParaRespostaCliente(raw),
                };
            })
        );

        res.json(ocorrenciasComImagem);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// BUSCAR POR ID
router.get('/:id', async (req, res) => {
    try {
        const ocorrencia = await Ocorrencia.findById(req.params.id);

        if (!ocorrencia) {
            return res.status(404).json({ erro: 'Ocorrencia nao encontrada' });
        }

        const imagemPg = await getImagemPorOcorrenciaId(req.params.id);
        const resposta = ocorrencia.toObject();
        const raw = imagemPg || resposta.imagem || null;
        resposta.imagem = await imagemParaRespostaCliente(raw);

        return res.json(resposta);
    } catch (err) {
        return res.status(400).json({ erro: err.message });
    }
});

// ATUALIZAR (imagem: nova URL, omitir para manter, null ou "" para remover)
router.put('/:id', async (req, res) => {
    try {
        const { imagem, ...dadosOcorrencia } = req.body;
        const id = req.params.id;

        const mongoUpdate = { ...dadosOcorrencia };

        if (imagem === null || imagem === '') {
            mongoUpdate.$unset = { imagem: '' };
            await deleteImagemPorOcorrenciaId(id);
        } else if (imagem !== undefined) {
            mongoUpdate.imagem = imagem;
            await upsertImagemOcorrencia(id, imagem);
        }

        const ocorrencia = await Ocorrencia.findByIdAndUpdate(id, mongoUpdate, { new: true });

        if (!ocorrencia) {
            return res.status(404).json({ erro: 'Ocorrencia nao encontrada' });
        }

        const imagemPg = await getImagemPorOcorrenciaId(id);
        const resposta = ocorrencia.toObject();
        const raw = imagemPg || resposta.imagem || null;
        resposta.imagem = await imagemParaRespostaCliente(raw);

        return res.json(resposta);
    } catch (err) {
        return res.status(400).json({ erro: err.message });
    }
});

// DELETAR
router.delete('/:id', async (req, res) => {
    try {
        await Ocorrencia.findByIdAndDelete(req.params.id);
        await deleteImagemPorOcorrenciaId(req.params.id);
        res.json({ mensagem: 'Ocorrência deletada' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

module.exports = router;