const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');

function getS3Client() {
  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error('AWS_REGION nao definido no ambiente.');
  }
  return new S3Client({ region });
}

function buildPublicObjectUrl(bucket, region, key) {
  const encodedKey = key.split('/').map((segment) => encodeURIComponent(segment)).join('/');
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

function isAllowedS3Key(key) {
  if (!key || typeof key !== 'string' || key.includes('..')) return false;
  return key.startsWith('ocorrencias/');
}

/** Extrai bucket e key de URLs estilo virtual-hosted (como as geradas por buildPublicObjectUrl). */
function parseS3VirtualHostedUrl(urlString) {
  try {
    const u = new URL(urlString);
    const pathname = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
    const key = pathname.split('/').map((s) => decodeURIComponent(s)).join('/');
    const host = u.hostname;

    const regional = host.match(/^([^.]+)\.s3\.([a-z0-9-]+)\.amazonaws\.com$/i);
    if (regional) {
      return { bucket: regional[1], key };
    }
    const legacy = host.match(/^([^.]+)\.s3\.amazonaws\.com$/i);
    if (legacy) {
      return { bucket: legacy[1], key };
    }
  } catch {
    return null;
  }
  return null;
}

function resolveBucketAndKeyFromStored(stored) {
  const expectedBucket = process.env.AWS_S3_BUCKET;
  if (!expectedBucket || !stored || typeof stored !== 'string') {
    return null;
  }
  const trimmed = stored.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const parsed = parseS3VirtualHostedUrl(trimmed);
    if (!parsed || parsed.bucket !== expectedBucket || !isAllowedS3Key(parsed.key)) {
      return null;
    }
    return { bucket: parsed.bucket, key: parsed.key };
  }
  const key = trimmed.replace(/^\/+/, '');
  if (!isAllowedS3Key(key)) {
    return null;
  }
  return { bucket: expectedBucket, key };
}

/**
 * URL temporária para leitura (GetObject) quando o bucket/objeto é privado.
 * Requer permissão s3:GetObject nas credenciais do backend.
 * Validade: S3_PRESIGN_EXPIRES_SECONDS (60–86400), padrão 3600.
 */
async function getPresignedGetUrlForStoredImage(stored) {
  const bk = resolveBucketAndKeyFromStored(stored);
  if (!bk) {
    return null;
  }
  try {
    const client = getS3Client();
    const command = new GetObjectCommand({ Bucket: bk.bucket, Key: bk.key });
    const raw = Number(process.env.S3_PRESIGN_EXPIRES_SECONDS) || 3600;
    const expiresIn = Math.min(86400, Math.max(60, raw));
    return await getSignedUrl(client, command, { expiresIn });
  } catch (e) {
    console.warn('getPresignedGetUrlForStoredImage:', e.message);
    return null;
  }
}

/** Para respostas à API: devolve URL assinada se possível, senão o valor original (ex.: URL pública). */
async function imagemParaRespostaCliente(valorBruto) {
  if (!valorBruto) {
    return null;
  }
  const signed = await getPresignedGetUrlForStoredImage(valorBruto);
  return signed || valorBruto;
}

/**
 * Envia buffer para o bucket configurado em AWS_S3_BUCKET.
 * Credenciais: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY e opcionalmente AWS_SESSION_TOKEN.
 */
async function uploadToS3({ buffer, contentType, originalName, prefix = 'ocorrencias' }) {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET nao definido no ambiente.');
  }

  const region = process.env.AWS_REGION;
  const ext = path.extname(originalName || '') || '.bin';
  const safeBase = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  const cleanPrefix = String(prefix).replace(/^\/+|\/+$/g, '');
  const key = cleanPrefix ? `${cleanPrefix}/${safeBase}` : safeBase;

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
    })
  );

  return {
    key,
    url: buildPublicObjectUrl(bucket, region, key),
    bucket,
    region,
  };
}

module.exports = {
  uploadToS3,
  buildPublicObjectUrl,
  getPresignedGetUrlForStoredImage,
  imagemParaRespostaCliente,
};
