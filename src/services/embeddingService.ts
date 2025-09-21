import axios from "axios";
import { mockProducts } from '../banco/mockProducts';
import { Product } from "../types/product";

export class EmbeddingService {
    private embedUrl: string;
    private topK: number;

    constructor() {
        // URL do Ollama local
        this.embedUrl = process.env.EMBEDDING_SERVICE_URL || "http://127.0.0.1:11434/api/embed";
        this.topK = 5; // quantidade de resultados mais relevantes
    }

    // Função utilitária para calcular cosine similarity
    private cosineSim(a: number[], b: number[]): number {
        const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dot / (magA * magB);
    }

    // Gera embedding de um texto via Ollama
    private async getEmbedding(text: string): Promise<number[]> {
        const response = await axios.post(this.embedUrl, {
            model: "embeddinggemma:latest",
            input: [text],
        });
        return response.data.embeddings[0]; // vetor do primeiro item
    }

    // Retorna os produtos mais relevantes baseado na pergunta
    async getRelevantProducts(query: string): Promise<Product[]> {
        const queryEmbedding = await this.getEmbedding(query);

        // Para cada produto, gerar embedding do description (ou name)
        const scoredProducts: { product: Product; score: number }[] = [];
        for (const p of mockProducts) {
            const productEmbedding = await this.getEmbedding(p.description || p.name);
            const score = this.cosineSim(queryEmbedding, productEmbedding);
            scoredProducts.push({ product: p, score });
        }

        // Ordena por similaridade e retorna topK
        scoredProducts.sort((a, b) => b.score - a.score);
        return scoredProducts.slice(0, this.topK).map((x) => x.product);
    }

    buildPrompt(scoredProducts: Product[]): string {
        let content = "Você é um assistente de um sistema de pedidos e produtos.\n\n";
        content += "Aqui estão alguns produtos relevantes para a consulta:\n";
        scoredProducts.forEach((p, idx) => {
            content += `${idx + 1}. ${p.name} - ${p.description}\n`;
        });
        content += "\nUse essas informações para responder à pergunta do usuário de forma clara e objetiva.";
        return content
    }
}