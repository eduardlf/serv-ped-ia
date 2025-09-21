# serv-ped-ia

API Node.js básica para teste de criação de pedidos usando IA

## Descrição

Serviço de assistente de IA para criar pedidos, desenvolvido em TypeScript com Node.js e Express. O serviço se comunica com um serviço de IA para processar consultas em linguagem natural e criar pedidos estruturados.

## Funcionalidades

- ✅ API REST com TypeScript e Express
- ✅ Integração com serviço de IA para chat completions
- ✅ Criação de pedidos através de consultas em linguagem natural
- ✅ Gerenciamento de status de pedidos
- ✅ Endpoint de chat direto com IA
- ✅ Configuração por variáveis de ambiente

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/eduardlf/serv-ped-ia.git
cd serv-ped-ia

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Compilar o projeto
npm run build
```

## Uso

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Pedidos

#### Criar pedido através de consulta IA
```
POST /api/orders
Content-Type: application/json

{
  "query": "Quero pedir 2 pizzas margherita e 1 refrigerante"
}
```

#### Listar todos os pedidos
```
GET /api/orders
```

#### Buscar pedido por ID
```
GET /api/orders/:id
```

#### Atualizar status do pedido
```
PATCH /api/orders/:id/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

#### Chat direto com IA
```
POST /api/orders/chat
Content-Type: application/json

{
  "query": "Olá, como você pode me ajudar?"
}
```

## Configuração

O serviço utiliza as seguintes variáveis de ambiente:

- `PORT`: Porta do servidor (padrão: 3000)
- `AI_SERVICE_URL`: URL do serviço de IA (padrão: http://127.0.0.1:5000)

## Arquitetura

```
src/
├── app.ts              # Aplicação principal
├── types/              # Definições de tipos TypeScript
├── services/           # Serviços (AI e Orders)
├── controllers/        # Controladores das rotas
└── routes/             # Definições de rotas
```

## Exemplo de Uso

O serviço espera que um serviço de IA esteja rodando em `http://127.0.0.1:5000` com um endpoint compatível com OpenAI API:

```bash
# Exemplo de consulta que funcionaria com o Python de referência:
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"query": "Quero 2 hambúrgueres e 1 batata frita"}'
```
