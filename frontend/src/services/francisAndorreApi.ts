/**
 * Service API pour Francis Andorre Expert
 * Utilise le modèle LLM spécialisé côté backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fiscal-ia-backend.up.railway.app';

export interface FrancisMessage {
  question: string;
  conversation_history?: any[];
  use_embeddings?: boolean;
}

export interface FrancisResponse {
  type: 'full_response' | 'error' | 'chunk';
  answer?: string;
  sources?: string[];
  confidence?: number;
  model?: string;
  status?: string;
  message?: string;
}

export class FrancisAndorreAPI {
  private abortController: AbortController | null = null;

  async sendMessage(
    message: string, 
    conversationHistory: any[] = [],
    onChunk?: (chunk: FrancisResponse) => void
  ): Promise<FrancisResponse> {
    try {
      // Annuler toute requête en cours
      if (this.abortController) {
        this.abortController.abort();
      }
      
      this.abortController = new AbortController();
      
      const payload: FrancisMessage = {
        question: message,
        conversation_history: conversationHistory,
        use_embeddings: true
      };

      const response = await fetch(`${API_BASE_URL}/api/stream-francis-andorre-expert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      // Si streaming activé
      if (response.body && onChunk) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullText += chunk;
          
          // Envoyer le chunk de texte directement sans parsing JSON
          const chunkResponse: FrancisResponse = {
            type: 'message_chunk',
            content: chunk,
            message: chunk
          };
          onChunk(chunkResponse);
        }

        // Retourner la réponse complète
        return {
          type: 'full_response',
          content: fullText,
          message: fullText
        };
      } 
      // Sinon, lecture simple
      else {
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line) as FrancisResponse;
            if (data.type === 'full_response') {
              return data;
            }
          } catch (e) {
            console.error('Erreur parsing response:', e);
          }
        }
        
        throw new Error('Réponse invalide du serveur');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { 
          type: 'error', 
          message: 'Requête annulée' 
        };
      }
      
      console.error('Erreur API Francis:', error);
      return { 
        type: 'error', 
        message: error.message || 'Erreur de communication avec le serveur' 
      };
    }
  }

  cancel() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
