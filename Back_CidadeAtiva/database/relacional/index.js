const { Pool } = require('pg');

let pool;
/** Só true após connectRelational() concluir com sucesso. */
let relationalReady = false;

function isRelationalReady() {
  return relationalReady;
}

function getPool() {
  if (pool) {
    return pool;
  }

  if (process.env.POSTGRES_URL) {
    pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    return pool;
  }

  pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  return pool;
}

async function connectRelational() {
  relationalReady = false;
  const relationalPool = getPool();

  await relationalPool.query(`
    CREATE TABLE IF NOT EXISTS ocorrencia_imagens (
      id BIGSERIAL PRIMARY KEY,
      ocorrencia_id VARCHAR(64) NOT NULL UNIQUE,
      image_url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await relationalPool.query(`
    CREATE INDEX IF NOT EXISTS idx_ocorrencia_imagens_ocorrencia_id
    ON ocorrencia_imagens (ocorrencia_id);
  `);

  relationalReady = true;
  console.log('PostgreSQL conectado!');
}

async function upsertImagemOcorrencia(ocorrenciaId, imageUrl) {
  if (!imageUrl || !relationalReady) return;

  const relationalPool = getPool();
  await relationalPool.query(
    `
    INSERT INTO ocorrencia_imagens (ocorrencia_id, image_url)
    VALUES ($1, $2)
    ON CONFLICT (ocorrencia_id)
    DO UPDATE SET
      image_url = EXCLUDED.image_url,
      updated_at = NOW();
    `,
    [ocorrenciaId, imageUrl]
  );
}

async function getImagemPorOcorrenciaId(ocorrenciaId) {
  if (!relationalReady) return null;
  try {
    const relationalPool = getPool();
    const result = await relationalPool.query(
      'SELECT image_url FROM ocorrencia_imagens WHERE ocorrencia_id = $1',
      [ocorrenciaId]
    );

    return result.rows[0]?.image_url || null;
  } catch (e) {
    console.warn('Postgres (getImagemPorOcorrenciaId):', e.message);
    return null;
  }
}

async function getImagensPorOcorrenciaIds(ocorrenciaIds) {
  if (!relationalReady || !ocorrenciaIds.length) return {};

  try {
    const relationalPool = getPool();
    const result = await relationalPool.query(
      `
      SELECT ocorrencia_id, image_url
      FROM ocorrencia_imagens
      WHERE ocorrencia_id = ANY($1::varchar[]);
      `,
      [ocorrenciaIds]
    );

    return result.rows.reduce((acc, row) => {
      acc[row.ocorrencia_id] = row.image_url;
      return acc;
    }, {});
  } catch (e) {
    console.warn('Postgres (getImagensPorOcorrenciaIds):', e.message);
    return {};
  }
}

async function deleteImagemPorOcorrenciaId(ocorrenciaId) {
  if (!relationalReady) return;
  try {
    const relationalPool = getPool();
    await relationalPool.query(
      'DELETE FROM ocorrencia_imagens WHERE ocorrencia_id = $1',
      [ocorrenciaId]
    );
  } catch (e) {
    console.warn('Postgres (deleteImagemPorOcorrenciaId):', e.message);
  }
}

module.exports = {
  connectRelational,
  isRelationalReady,
  upsertImagemOcorrencia,
  getImagemPorOcorrenciaId,
  getImagensPorOcorrenciaIds,
  deleteImagemPorOcorrenciaId,
};
