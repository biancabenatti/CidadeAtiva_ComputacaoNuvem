const modal = document.getElementById('editModal');
const closeBtn = document.querySelector('.close');

let idAtual = null;

// LISTAR
async function carregarOcorrencias() {
    const response = await fetch('http://localhost:5000/api/ocorrencias');
    const dados = await response.json();

    const lista = document.querySelector('.occurrences-list');
    lista.innerHTML = '';

    dados.forEach(o => {
        lista.innerHTML += `
        <div class="card">
            <div class="card-info">
                <strong>${o.titulo}</strong>

                <p class="card-label">Localização</p>
                <p class="text-data">${o.localizacao}</p>

                <p class="card-label">Descrição</p>
                <p class="text-description">${o.descricao}</p>
            </div>

            <div class="card-actions-vertical">
                <button class="btn-icon edit"
                    onclick="abrirModal('${o._id}', '${o.titulo}', '${o.localizacao}', '${o.descricao}')">
                    <i class="fas fa-pencil-alt"></i>
                </button>

                <button class="btn-icon delete"
                    onclick="deletarOcorrencia('${o._id}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
        `;
    });
}

// DELETE
async function deletarOcorrencia(id) {

    const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: 'Essa ocorrência será deletada!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, deletar',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmacao.isConfirmed) return;

    try {
        await fetch(`http://localhost:5000/api/ocorrencias/${id}`, {
            method: 'DELETE'
        });

        await Swal.fire({
            icon: 'success',
            title: 'Deletado!',
            text: 'Ocorrência removida com sucesso.'
        });

        carregarOcorrencias();

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Não foi possível deletar.'
        });
    }
}

// ABRIR MODAL
function abrirModal(id, titulo, localizacao, descricao) {
    idAtual = id;

    document.getElementById('editTitle').value = titulo;
    document.getElementById('editLocation').value = localizacao;
    document.getElementById('editDescription').value = descricao;

    modal.style.display = 'block';
}

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
        descricao: document.getElementById('editDescription').value
    };

    try {
        await fetch(`http://localhost:5000/api/ocorrencias/${idAtual}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosAtualizados)
        });

        modal.style.display = 'none';

        await Swal.fire({
            icon: 'success',
            title: 'Atualizado!',
            text: 'Ocorrência alterada com sucesso.'
        });

        carregarOcorrencias();

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: 'Não foi possível atualizar.'
        });
    }
});

carregarOcorrencias();