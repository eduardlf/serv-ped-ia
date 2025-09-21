import { Request, Response } from "express";
import { OrderService } from "../services/orderService";
import { AIService } from "../services/aiService";
import { mockProducts } from '../banco/mockProducts';
import { EmbeddingService } from "../services/embeddingService";

const embeddingService = new EmbeddingService();
const orderService = new OrderService();
const aiService = new AIService();

// Funções mock disponíveis
const MOCK_FUNCTIONS = {
  criar_produto: (...args: any[]) => {
    mockProducts.push({
      id: (mockProducts.length + 1).toString(),
      name: args[0],
      description: 'Descrição padrão',
      price: 100.00,
    });
    return `Produto '${args[0]}' criado :D !`
  },
  consulta_produto: async (...args: any[]) => {
    const pergunta = args[0];
    const relevantProducts = await embeddingService.getRelevantProducts(pergunta);
    try {
      const aiResponse = await aiService.chatCompletion([
        { "role": "system", "content": embeddingService.buildPrompt(relevantProducts) },
        { role: "user", content: pergunta },
      ]);
      return aiResponse.message;
    } catch (err: any) {
      return "Erro interno";
    }
  },
};

const TOOLS = [
  {
    type: "function",
    function: {
      name: "criar_produto",
      description: "Cria um produto usando um nome.",
      parameters: {
        type: "object",
        properties: {
          nome: {
            type: "string",
            description: "Nome do produto que vai ser cadastrado",
          },
        },
        required: ["nome"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "consulta_produto",
      description: "consulta os produtos usando uma pergunta como referência.",
      parameters: {
        type: "object",
        properties: {
          pergunta: {
            type: "string",
            description: "pergunta que será usada como referência para encontrar produtos relevantes",
          },
        },
        required: ["pergunta"],
      },
    },
  },
];

function buildPrompt(): string {
  return "Você é um assistente de um sistema de pedido e produtos.\n"+
  "Responda apenas questoes relacionadas a pedidos e produtos.\n"+
  "Se a pergunta não for relacionada a pedidos ou produtos, responda que não pode ajudar.\n"+
  "Seja educado e prestativo.";
}

interface ToolCall {
  name: keyof typeof MOCK_FUNCTIONS;
  arguments?: Record<string, any>;
}

function extractToolCall(text: string): ToolCall | null {
  const match = text.match(/<tool_call>\s*.(\{.*?\}).\s*<\/tool_call>/s);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as ToolCall;
  } catch {
    return null;
  }
}


export class OrderController {

  createOrder = async (req: Request, res: Response) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query obrigatória" });

    try {
      // Monta prompt e envia para IA
      const aiResponse = await aiService.chatCompletion(
        [
          { role: "system", content: buildPrompt() },
          { role: "user", content: query },
        ],
        TOOLS
      );

      const message = aiResponse.message;
      const toolCall = extractToolCall(message);

      if (toolCall && toolCall.name in MOCK_FUNCTIONS) {
        const args = toolCall.arguments || {};
        const fn = MOCK_FUNCTIONS[toolCall.name];
        // Dynamically get parameter names and pass arguments accordingly
        const paramNames = Object.keys(args);
        const result = await fn(...paramNames.map((key) => args[key]));
        return res.json({ resultado: result, toolCall });
      }

      return res.json({ mensagem: message });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro interno" });
    }
  };

  getAllOrders = (_req: Request, res: Response) => {
    res.json(orderService.getAllOrders());
  };

  getOrderById = (req: Request, res: Response) => {
    const order = orderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    res.json(order);
  };

  updateOrderStatus = (req: Request, res: Response) => {
    const { status } = req.body;
    const updated = orderService.updateOrderStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Pedido não encontrado" });
    res.json(updated);
  };

  chatWithAI = async (req: Request, res: Response) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query obrigatória" });

    try {
      const aiResponse = await aiService.chatCompletion([
        { "role": "system", "content": buildPrompt() },
        { role: "user", content: query },
      ]);
      res.json({ resposta: aiResponse.message });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erro interno" });
    }
  }
}