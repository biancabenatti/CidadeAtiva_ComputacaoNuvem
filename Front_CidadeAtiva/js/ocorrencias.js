const modal = document.getElementById('editModal');
const closeBtn = document.querySelector('.close');
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000';

function mensagemErroRede(error) {
  if (error && (error.message === 'Failed to fetch' || error.name === 'TypeError')) {
    return 'Não foi possível conectar à API em '
      + API_BASE_URL
      + '. Deixe o backend rodando (npm run dev na pasta Back_CidadeAtiva) e abra esta página por um servidor HTTP (Live Server, etc.), não dê duplo clique no HTML (file:// bloqueia fetch em muitos navegadores).';
  }
  return error?.message || 'Erro desconhecido.';
}

let idAtual = null;

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// LISTAR (API: Mongo + imagem no Postgres)
async function carregarOcorrencias() {
    const lista = document.querySelector('.occurrences-list');
    lista.innerHTML = '<p class="occurrences-status">Carregando ocorrências…</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/ocorrencias`);
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
        <div class="card">
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

// DELETE
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
        const res = await fetch(`${API_BASE_URL}/api/ocorrencias/${id}`, {
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

// ABRIR MODAL (dados reais do banco via GET /:id)
async function abrirModalEditar(id) {
    idAtual = id;

    try {
        const res = await fetch(`${API_BASE_URL}/api/ocorrencias/${id}`);
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.erro || 'Ocorrência não encontrada.');
        }

        const o = await res.json();
        document.getElementById('editTitle').value = o.titulo || '';
        document.getElementById('editLocation').value = o.localizacao || '';
        document.getElementById('editDescription').value = o.descricao || '';

        modal.style.display = 'block';
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
        abrirModalEditar(editBtn.dataset.id);
        return;
    }
    const delBtn = e.target.closest('.btn-icon.delete');
    if (delBtn) {
        deletarOcorrencia(delBtn.dataset.id);
    }
});

// FECHAR
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// UPDATE
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dadosAtualizados = {
        titulo: document.getElementById('editTitle').value,
        localizacao: document.getElementById('editLocation').value,
        descricao: document.getElementById('editDescription').value,
    };

    try {
        const res = await fetch(`${API_BASE_URL}/api/ocorrencias/${idAtual}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosAtualizados),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.erro || 'Não foi possível atualizar.');
        }

        modal.style.display = 'none';

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
