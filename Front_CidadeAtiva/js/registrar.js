const form = document.getElementById('formOcorrencia');

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
        const response = await fetch('http://localhost:5000/api/ocorrencias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, localizacao, descricao })
        });

        if (!response.ok) throw new Error();

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
            text: 'Não foi possível registrar.'
        });
    }
});