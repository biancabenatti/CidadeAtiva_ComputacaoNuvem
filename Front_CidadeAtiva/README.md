# Cidade Ativa - Front-end

Interface web do projeto Cidade Ativa, uma aplicação para registro e acompanhamento de ocorrências urbanas.

---

## Sobre o projeto

O Cidade Ativa permite que usuários registrem problemas na cidade, como:

- Buracos na rua
- Iluminação pública com defeito
- Problemas de infraestrutura
- Ocorrências em geral

Este repositório contém o **front-end**, desenvolvido com tecnologias web básicas e integrado a uma API REST.

---

## Funcionalidades

### Registrar ocorrência
- Cadastro de título, localização e descrição
- Validação de campos obrigatórios
- Feedback visual com SweetAlert

### Listar ocorrências
- Exibição dinâmica das ocorrências cadastradas
- Dados vindos da API

### Editar ocorrência
- Modal para edição
- Atualização em tempo real

### Deletar ocorrência
- Confirmação antes de excluir
- Atualização automática da lista

---

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- SweetAlert2
- Fetch API

---

## Integração com o back-end

Este front-end consome uma API REST desenvolvida em Node.js.

### Endpoints utilizados:

| Método | Rota                          | Descrição                  |
|--------|-------------------------------|----------------------------|
| GET    | /api/ocorrencias              | Listar ocorrências         |
| POST   | /api/ocorrencias              | Criar ocorrência           |
| PUT    | /api/ocorrencias/:id          | Atualizar ocorrência       |
| DELETE | /api/ocorrencias/:id          | Deletar ocorrência         |
