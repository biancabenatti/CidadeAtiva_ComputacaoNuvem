# Cidade Ativa - Back-end

API para gerenciar ocorrências em uma cidade. Permite criar, listar, editar e deletar ocorrências de forma simples.

## Tecnologias

- Node.js
- Express
- MongoDB Atlas
- Swagger (Documentação de API)


## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/biancabenatti/CidadeAtiva_ComputacaoNuvem
```
Entre na pasta do back-end:
```
cd Back_CidadeAtiva
```
Instale as dependências:
```
npm install
```
Crie um arquivo .env com as variáveis:
```
MONGO_URI=sua_string_de_conexao_mongodb
PORT=5000
```
Rode o servidor em modo desenvolvimento:
```
npm run dev
```

O servidor vai rodar em http://localhost:5000.

A documentação completa está disponível no Swagger:
```
http://localhost:5000/api-docs
```

Nota: O campo imagem é opcional por enquanto.

### Observações Importantes
- O ID das ocorrências é gerado automaticamente pelo MongoDB (_id), não é sequencial.
- Por enquanto, a API funciona sem upload de imagens.
- Use o Swagger para testar todas as rotas facilmente.

