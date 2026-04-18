const form = document.getElementById('formOcorrencia');
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000';

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const localizacao = document.getElementById('localizacao').value;
    const descricao = document.getElementById('descricao').value;

    if (!titulo || !localizacao || !descricao) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos obrigatórios!',
            text: 'Preencha todos os campos.'
        });
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/ocorrencias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, localizacao, descricao })
        });

        if (!response.ok) {
            const erroApi = await response.json().catch(() => null);
            const mensagem = erroApi?.erro || 'Nao foi possivel registrar.';
            throw new Error(mensagem);
        }

        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: 'Ocorrência registrada'
        });

        form.reset();

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: error.message
        });
    }
});