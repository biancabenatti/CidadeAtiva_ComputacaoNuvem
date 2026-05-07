# ☁️ Projeto Cidade Ativa

## 📌 Sobre o Projeto

Este projeto tem como objetivo implementar uma aplicação completa em ambiente de computação em nuvem utilizando a AWS, garantindo integração entre backend, frontend e banco de dados, além de aplicar boas práticas de monitoramento, observabilidade e exposição de serviços.

---

### 🔗 Integração na Nuvem

* Integração entre:

  * Backend
  * Frontend
  * Banco de Dados (SQL e NoSQL)
* Toda a aplicação operando **100% na AWS**

---

## 📊 Monitoramento e Observabilidade

Foi configurado o monitoramento da aplicação backend utilizando o **Amazon CloudWatch** em uma instância EC2.

### 🎯 Objetivo

Habilitar coleta de métricas e logs para análise e troubleshooting da aplicação.

---

### ⚙️ Instalação do CloudWatch Agent

```bash
# Download
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb

# Instalação
sudo dpkg -i amazon-cloudwatch-agent.deb
```

---

### 🛠️ Configuração do Agente

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

#### Parâmetros utilizados:

* Ambiente: EC2
* Monitoramento de host: Ativado

#### Métricas coletadas:

* `mem_used_percent` (uso de memória)

* `disk_used_percent` (uso de disco)

* Intervalo: 60 segundos

#### Métricas desativadas (otimização de custo):

* CPU por core
* StatsD
* CollectD
* Alta resolução

---

### 📁 Logs configurados

* Arquivo monitorado:

```
/home/ubuntu/CidadeAtiva_ComputacaoNuvem/Back_CidadeAtiva/logs/app.log
```

* Log Group: `cidade-ativa-app`
* Log Stream: `{instance_id}`
* Retenção: 14 dias

---

### 🚀 Ativação do Agente

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
-a fetch-config \
-m ec2 \
-c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json \
-s
```

Verificação:

```bash
sudo systemctl status amazon-cloudwatch-agent
```

Resultado esperado:

```
active (running)
```

---

### 📈 Dados Coletados

#### Métricas:

* Uso de memória (%)
* Uso de disco (%)

#### Logs:

* Syslog do sistema Linux
* Logs da aplicação

As métricas podem ser visualizadas no painel do CloudWatch em:

```
All Metrics > CWAgent
```

---

## 🌐 Exposição via DNS

### 🎯 Objetivo

Substituir o uso de IP público por um **DNS amigável**.

### 🔗 DNS da Instância

```
ec2-3-94-131-60.compute-1.amazonaws.com
```

---

### 💻 Acesso à Aplicação

#### Frontend:

```
http://ec2-3-94-131-60.compute-1.amazonaws.com
```

#### Backend (antes):

```
http://ec2-3-94-131-60.compute-1.amazonaws.com:5000
```

---

### 🔄 Substituição do IP

Antes:

```
http://3.94.131.60
```

Depois:

```
http://ec2-3-94-131-60.compute-1.amazonaws.com
```

✔️ Benefício: evita problemas com mudança de IP da instância.

---

### 🔁 Integração com Frontend

* Configuração dinâmica de ambiente:

  * Local
  * Nuvem
* Seleção automática da URL da API
* Sem necessidade de alteração manual

---

## 🔐 Remoção de Portas (Proxy Reverso)

### 🎯 Objetivo

Ocultar portas do backend utilizando **Nginx como proxy reverso**.

---

### 🏗️ Arquitetura

* **Frontend**: servido via Nginx
  `/var/www/html`

* **Backend (Node.js)**:
  `localhost:5000` (não exposto)

* **Nginx**:

  * Recebe requisições externas
  * Redireciona internamente

---

### ⚙️ Configuração do Nginx

```nginx
location / {
    root /var/www/html;
    index index.html;
}

location /api/ {
    proxy_pass http://localhost:5000/;
}
```

---

### 🌍 Funcionamento

* `/` → Frontend
* `/api/` → Backend (internamente)

✔️ Resultado:

* Backend não exposto diretamente
* URLs mais limpas (sem porta)
* Maior segurança e organização

---

## 🧱 Arquitetura Geral

* AWS EC2 hospedando aplicação
* CloudWatch para monitoramento
* Nginx como proxy reverso
* Backend Node.js
* Frontend estático

---

## 📊 Resultados

* Monitoramento ativo com métricas em tempo real
* Logs centralizados
* Aplicação acessível via DNS
* Remoção de exposição de portas
* Integração completa em nuvem

---

## 📄 Considerações Finais

O projeto demonstra a aplicação prática de conceitos de computação em nuvem utilizando AWS, com foco em:

* Observabilidade
* Segurança
* Boas práticas de arquitetura
* Escalabilidade e manutenção

---
