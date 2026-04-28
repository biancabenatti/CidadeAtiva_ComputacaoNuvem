const editModal = document.getElementById('editModal');
const viewModal = document.getElementById('viewModal');
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://127.0.0.1:5000';

/** 'manter' | 'remover' | 'nova' */
let editAcaoImagem = 'manter';
let idAtual = null;

function mensagemErroRede(error) {
  if (error && (error.message === 'Failed to fetch' || error.name === 'TypeError')) {
    return 'Não foi possível conectar à API em '
      + API_BASE_URL
      + '. Rode o backend (npm run dev em Back_CidadeAtiva), abra '
      + API_BASE_URL
      + ' no navegador (deve aparecer texto do servidor), use Live Server (http://) e não file://. Outra porta: ?api=http://127.0.0.1:PORTA';
  }
  return error?.message || 'Erro desconhecido.';
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function arquivoEhImagemPermitida(file) {
  if (!file) return true;
  const mime = (file.type || '').toLowerCase();
  if (mime.startsWith('image/')) return true;
  const nome = (file.name || '').toLowerCase();
  return /\.(jpe?g|png|gif|webp)$/i.test(nome);
}

function resetEditImagemUi() {
  editAcaoImagem = 'manter';
  const input = document.getElementById('editFoto');
  if (input) input.value = '';
  const wrap = document.getElementById('editImagemPreviewWrap');
  const img = document.getElementById('editImagemPreview');
  if (wrap) wrap.hidden = true;
  if (img) img.removeAttribute('src');
}

// LISTAR
async function carregarOcorrencias() {
  const lista = document.querySelector('.occurrences-list');
  lista.innerHTML = '<p class="occurrences-status">Carregando ocorrências…</p>';

  try {
    const response = await fetch(`${window.APP_CONFIG.API_BASE_URL}:5000/api/ocorrencias`);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const detalhe = body?.erro ? String(body.erro) : `HTTP ${response.status}`;
      throw new Error(`Não foi possível carregar as ocorrências. ${detalhe}`);
    }

    let dados;
    try {
      dados = await response.json();
    } catch {
      throw new Error('A API não retornou JSON. Verifique a URL da API e o backend.');
    }
    if (!Array.isArray(dados)) {
      throw new Error('Resposta inesperada da API (esperava uma lista).');
    }
    lista.innerHTML = '';

    if (!dados.length) {
      lista.innerHTML = '<p class="occurrences-status">Nenhuma ocorrência cadastrada.</p>';
      return;
    }

    dados.forEach((o) => {
      const id = String(o._id ?? o.id ?? '');
      if (!id) return;
      const imagemHtml = o.imagem
        ? `<div class="card-image-preview"><img src="${escapeHtml(o.imagem)}" alt="Foto da ocorrência"></div>`
        : '';

      lista.innerHTML += `
        <div class="card" data-id="${escapeHtml(id)}">
            <div class="card-info">
                <strong>${escapeHtml(o.titulo)}</strong>

                <p class="card-label">Localização</p>
                <p class="text-data">${escapeHtml(o.localizacao)}</p>

                <p class="card-label">Descrição</p>
                <p class="text-description">${escapeHtml(o.descricao)}</p>
            </div>

            <div class="card-actions-vertical">
                <button type="button" class="btn-icon edit" data-id="${escapeHtml(id)}" title="Editar">
                    <i class="fas fa-pencil-alt"></i>
                </button>

                <button type="button" class="btn-icon delete" data-id="${escapeHtml(id)}" title="Deletar">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            ${imagemHtml}
        </div>
        `;
    });
  } catch (error) {
    lista.innerHTML = `<p class="occurrences-status">${escapeHtml(mensagemErroRede(error))}</p>`;
  }
}

async function deletarOcorrencia(id) {
  const confirmacao = await Swal.fire({
    title: 'Tem certeza?',
    text: 'Essa ocorrência será deletada!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim, deletar',
    cancelButtonText: 'Cancelar',
  });

  if (!confirmacao.isConfirmed) return;

  try {
    const res = await fetch(`${window.APP_CONFIG.API_BASE_URL}:5000/api/ocorrencias/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.erro || 'Não foi possível deletar.');
    }

    await Swal.fire({
      icon: 'success',
      title: 'Deletado!',
      text: 'Ocorrência removida com sucesso.',
    });

    carregarOcorrencias();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erro!',
      text: error.message,
    });
  }
}

async function abrirModalVisualizar(id) {
  try {
    const res = await fetch(`${window.APP_CONFIG.API_BASE_URL}:5000/api/ocorrencias/${id}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.erro || 'Ocorrência não encontrada.');
    }

    const o = await res.json();
    document.getElementById('viewTitulo').textContent = o.titulo || '—';
    document.getElementById('viewLocalizacao').textContent = o.localizacao || '—';
    document.getElementById('viewDescricao').textContent = o.descricao || '—';

    const wrap = document.getElementById('viewImagemWrap');
    const img = document.getElementById('viewImagem');
    if (o.imagem) {
      img.src = o.imagem;
      wrap.hidden = false;
    } else {
      wrap.hidden = true;
      img.removeAttribute('src');
    }

    viewModal.style.display = 'block';
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erro!',
      text: error.message,
    });
  }
}

async function abrirModalEditar(id) {
  idAtual = id;
  resetEditImagemUi();

  try {
    const res = await fetch(`${window.APP_CONFIG.API_BASE_URL}:5000/api/ocorrencias/${id}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.erro || 'Ocorrência não encontrada.');
    }

    const o = await res.json();
    document.getElementById('editTitle').value = o.titulo || '';
    document.getElementById('editLocation').value = o.localizacao || '';
    document.getElementById('editDescription').value = o.descricao || '';

    if (o.imagem) {
      document.getElementById('editImagemPreview').src = o.imagem;
      document.getElementById('editImagemPreviewWrap').hidden = false;
    }

    editAcaoImagem = 'manter';
    editModal.style.display = 'block';
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erro!',
      text: error.message,
    });
  }
}

document.querySelector('.occurrences-list').addEventListener('click', (e) => {
  const editBtn = e.target.closest('.btn-icon.edit');
  if (editBtn) {
    e.stopPropagation();
    abrirModalEditar(editBtn.dataset.id);
    return;
  }
  const delBtn = e.target.closest('.btn-icon.delete');
  if (delBtn) {
    e.stopPropagation();
    deletarOcorrencia(delBtn.dataset.id);
    return;
  }

  const card = e.target.closest('.card');
  if (card && card.dataset.id) {
    abrirModalVisualizar(card.dataset.id);
  }
});

document.querySelector('.close-edit').addEventListener('click', () => {
  editModal.style.display = 'none';
});

document.querySelector('.close-view').addEventListener('click', () => {
  viewModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === editModal) editModal.style.display = 'none';
  if (e.target === viewModal) viewModal.style.display = 'none';
});

document.getElementById('editRemoverFoto').addEventListener('click', () => {
  editAcaoImagem = 'remover';
  document.getElementById('editFoto').value = '';
  document.getElementById('editImagemPreviewWrap').hidden = true;
  document.getElementById('editImagemPreview').removeAttribute('src');
});

document.getElementById('editFoto').addEventListener('change', () => {
  const file = document.getElementById('editFoto').files[0];
  if (!file) return;

  if (!arquivoEhImagemPermitida(file)) {
    Swal.fire({
      icon: 'warning',
      title: 'Arquivo não suportado',
      text: 'Use imagem JPG, PNG, GIF ou WebP.',
    });
    document.getElementById('editFoto').value = '';
    return;
  }

  editAcaoImagem = 'nova';
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById('editImagemPreview').src = ev.target.result;
    document.getElementById('editImagemPreviewWrap').hidden = false;
  };
  reader.readAsDataURL(file);
});

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const titulo = document.getElementById('editTitle').value.trim();
  const localizacao = document.getElementById('editLocation').value.trim();
  const descricao = document.getElementById('editDescription').value.trim();

  if (!titulo || !localizacao || !descricao) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obrigatórios',
      text: 'Preencha título, localização e descrição.',
    });
    return;
  }

  const payload = { titulo, localizacao, descricao };

  if (editAcaoImagem === 'remover') {
    payload.imagem = null;
  } else if (editAcaoImagem === 'nova') {
    const file = document.getElementById('editFoto').files[0];
    if (!file) {
      editAcaoImagem = 'manter';
    } else {
      Swal.fire({
        title: 'Enviando foto…',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        const formData = new FormData();
        formData.append('arquivo', file);
        formData.append('prefix', 'ocorrencias');
        const uploadRes = await fetch(`${window.APP_CONFIG.API_BASE_URL}:5000/api/upload`, {
          method: 'POST',
          body: formData,
        });
        const uploadBody = await uploadRes.json().catch(() => ({}));
        Swal.close();
        if (!uploadRes.ok || !uploadBody.url) {
          const r = await Swal.fire({
            icon: 'warning',
            title: 'Upload falhou',
            text: (uploadBody.erro || 'Não foi possível enviar a nova foto. Salvar só texto e dados atuais da foto?')
              + ' Se preferir, cancele e tente outra imagem.',
            showCancelButton: true,
            confirmButtonText: 'Salvar sem trocar a foto',
            cancelButtonText: 'Cancelar',
          });
          if (!r.isConfirmed) return;
          delete payload.imagem;
        } else {
          payload.imagem = uploadBody.url;
        }
      } catch (err) {
        Swal.close();
        const r = await Swal.fire({
          icon: 'warning',
          title: 'Erro no upload',
          text: 'Salvar alterações de texto sem trocar a foto?',
          showCancelButton: true,
          confirmButtonText: 'Sim',
          cancelButtonText: 'Não',
        });
        if (!r.isConfirmed) return;
        delete payload.imagem;
      }
    }
  }

  try {
    const res = await fetch(`${window.APP_CONFIG.API_BASE_URL}:5000/api/ocorrencias/${idAtual}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.erro || 'Não foi possível atualizar.');
    }

    editModal.style.display = 'none';

    await Swal.fire({
      icon: 'success',
      title: 'Atualizado!',
      text: 'Ocorrência alterada com sucesso.',
    });

    carregarOcorrencias();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erro!',
      text: error.message,
    });
  }
});

carregarOcorrencias();
