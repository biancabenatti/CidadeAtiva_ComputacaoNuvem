const form = document.getElementById('formOcorrencia');
const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://127.0.0.1:5000';

/** MIME image/* ou extensão conhecida (alguns SOs enviam WebP com tipo vazio ou genérico). */
function arquivoEhImagemPermitida(file) {
    if (!file) return true;
    const mime = (file.type || '').toLowerCase();
    if (mime.startsWith('image/')) return true;
    const nome = (file.name || '').toLowerCase();
    return /\.(jpe?g|png|gif|webp)$/i.test(nome);
}

function mensagemErroRede(error) {
    if (error && (error.message === 'Failed to fetch' || error.name === 'TypeError')) {
        return 'Não foi possível conectar à API em '
            + API_BASE_URL
            + '. 1) Rode o backend (npm run dev em Back_CidadeAtiva). 2) No navegador, abra '
            + API_BASE_URL
            + ' — deve aparecer "Servidor Cidade Ativa rodando!". 3) Use Live Server (http://), não file://. 4) Se a API estiver em outra porta, use na URL: ?api=http://127.0.0.1:PORTA';
    }
    return error?.message || 'Erro desconhecido.';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const localizacao = document.getElementById('localizacao').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const fotoInput = document.getElementById('foto');
    const arquivo = fotoInput?.files?.[0];

    if (!titulo || !localizacao || !descricao) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos obrigatórios!',
            text: 'Preencha título, localização e descrição.',
        });
        return;
    }

    if (arquivo && !arquivoEhImagemPermitida(arquivo)) {
        Swal.fire({
            icon: 'warning',
            title: 'Arquivo não suportado',
            text: 'Use imagem JPG, PNG, GIF ou WebP.',
        });
        return;
    }

    Swal.fire({
        title: 'Enviando…',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    let imagemUrl = null;
    let motivoSemFoto = '';

    if (arquivo) {
        try {
            const formData = new FormData();
            formData.append('arquivo', arquivo);
            formData.append('prefix', 'ocorrencias');

            const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            const uploadBody = await uploadRes.json().catch(() => ({}));

            if (uploadRes.ok && uploadBody.url) {
                imagemUrl = uploadBody.url;
            } else {
                const detalhe = uploadBody.erro || `HTTP ${uploadRes.status}`;
                motivoSemFoto = detalhe;
                console.warn('Upload S3 não concluído:', detalhe);
            }
        } catch (uploadErr) {
            motivoSemFoto = uploadErr.message || 'Erro de rede no upload';
            console.warn('Upload:', uploadErr);
        }
    }

    const payload = { titulo, localizacao, descricao };
    if (imagemUrl) {
        payload.imagem = imagemUrl;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/ocorrencias`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        let criado = null;
        try {
            criado = await response.json();
        } catch {
            criado = null;
        }

        if (!response.ok) {
            const mensagem = criado?.erro || `Não foi possível registrar (HTTP ${response.status}).`;
            throw new Error(mensagem);
        }

        let textoSucesso = 'Ocorrência registrada.';
        if (imagemUrl) {
            textoSucesso = 'Ocorrência registrada com foto.';
        } else if (arquivo && motivoSemFoto) {
            textoSucesso = `Ocorrência registrada sem foto. Motivo: ${motivoSemFoto}`;
        }

        Swal.fire({
            icon: imagemUrl || !arquivo ? 'success' : 'warning',
            title: imagemUrl || !arquivo ? 'Sucesso!' : 'Registrado sem foto',
            text: textoSucesso,
        });

        form.reset();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: mensagemErroRede(error),
        });
    }
});
