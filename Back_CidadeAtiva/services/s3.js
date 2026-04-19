const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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
};
