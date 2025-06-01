// 🚀 EXEMPLE D'UTILISATION DE L'API STREAMING FRANCIS
// Utilisation avec fetch() et ReadableStream

async function askFrancisStreaming(question, conversationHistory = null) {
    const API_BASE_URL = "https://normal-trade-production.up.railway.app";
    
    try {
        console.log("🚀 Démarrage du streaming Francis...");
        
        const response = await fetch(`${API_BASE_URL}/api/stream-francis-simple`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            },
            body: JSON.stringify({
                question: question,
                conversation_history: conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let fullAnswer = "";
        let currentProgress = 0;
        let sources = [];
        let confidence = 0;

        while (true) {
            const { value, done } = await reader.read();
            
            if (done) {
                console.log("✅ Streaming terminé");
                break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    const data = JSON.parse(line);
                    
                    switch (data.type) {
                        case 'status':
                            console.log(`📊 Progression: ${data.progress}% - ${data.message}`);
                            currentProgress = data.progress;
                            updateProgressUI(data.progress, data.message);
                            break;
                            
                        case 'start_response':
                            console.log("✍️ Début de la réponse Francis");
                            showResponseStart();
                            break;
                            
                        case 'content':
                            // Afficher le chunk de contenu en temps réel
                            fullAnswer += data.chunk;
                            appendToResponse(data.chunk);
                            break;
                            
                        case 'complete':
                            console.log("🎉 Réponse complète!");
                            console.log(`Sources: ${data.sources?.join(', ')}`);
                            console.log(`Confiance: ${data.confidence}`);
                            sources = data.sources || [];
                            confidence = data.confidence || 0;
                            showCompletionUI(sources, confidence);
                            break;
                            
                        case 'error':
                            console.error("❌ Erreur:", data.message);
                            showErrorUI(data.message);
                            break;
                    }
                } catch (e) {
                    console.warn("Ligne non-JSON ignorée:", line);
                }
            }
        }

        return {
            answer: fullAnswer,
            sources: sources,
            confidence: confidence,
            success: true
        };

    } catch (error) {
        console.error("❌ Erreur streaming:", error);
        return {
            error: error.message,
            success: false
        };
    }
}

// 🎨 FONCTIONS D'INTERFACE UTILISATEUR (à adapter selon votre UI)

function updateProgressUI(progress, message) {
    // Mettre à jour une barre de progression
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = message;
}

function showResponseStart() {
    // Afficher le début de la zone de réponse
    const responseArea = document.getElementById('francis-response');
    if (responseArea) {
        responseArea.innerHTML = '<div class="typing-indicator">Francis écrit...</div>';
    }
}

function appendToResponse(chunk) {
    // Ajouter du contenu à la réponse en temps réel
    const responseArea = document.getElementById('francis-response');
    if (responseArea) {
        // Supprimer l'indicateur de frappe s'il existe
        const typingIndicator = responseArea.querySelector('.typing-indicator');
        if (typingIndicator) typingIndicator.remove();
        
        // Ajouter le chunk (avec effet machine à écrire)
        responseArea.innerHTML += chunk;
        responseArea.scrollTop = responseArea.scrollHeight; // Auto-scroll
    }
}

function showCompletionUI(sources, confidence) {
    // Afficher les métadonnées finales
    const metaArea = document.getElementById('response-meta');
    if (metaArea) {
        metaArea.innerHTML = `
            <div class="response-complete">
                <p><strong>Sources:</strong> ${sources.join(', ')}</p>
                <p><strong>Confiance:</strong> ${Math.round(confidence * 100)}%</p>
            </div>
        `;
    }
    
    // Cacher la barre de progression
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) progressContainer.style.display = 'none';
}

function showErrorUI(errorMessage) {
    const responseArea = document.getElementById('francis-response');
    if (responseArea) {
        responseArea.innerHTML = `<div class="error">❌ ${errorMessage}</div>`;
    }
}

// 📞 EXEMPLE D'UTILISATION

// Utilisation basique
async function exempleUtilisation() {
    const question = "Quelles sont les tranches marginales d'imposition 2025?";
    const result = await askFrancisStreaming(question);
    
    if (result.success) {
        console.log("✅ Réponse reçue:", result.answer);
    } else {
        console.error("❌ Erreur:", result.error);
    }
}

// Utilisation avec historique de conversation
async function exempleAvecHistorique() {
    const conversationHistory = [
        { role: "assistant", content: "Bonjour, je suis Francis..." },
        { role: "user", content: "Je suis salarié et je veux optimiser mes impôts" }
    ];
    
    const question = "Quelles niches fiscales me recommandez-vous?";
    const result = await askFrancisStreaming(question, conversationHistory);
    
    console.log("Réponse avec contexte:", result);
}

// 🔧 INTÉGRATION REACT (exemple)
function FrancisStreamingComponent() {
    const [isStreaming, setIsStreaming] = React.useState(false);
    const [response, setResponse] = React.useState('');
    const [progress, setProgress] = React.useState(0);
    const [status, setStatus] = React.useState('');

    const handleStreamingQuestion = async (question) => {
        setIsStreaming(true);
        setResponse('');
        setProgress(0);
        
        try {
            const result = await askFrancisStreaming(question);
            if (result.success) {
                setResponse(result.answer);
            }
        } catch (error) {
            console.error('Erreur streaming:', error);
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <div className="francis-streaming">
            {isStreaming && (
                <div className="progress-bar">
                    <div className="progress" style={{width: `${progress}%`}}></div>
                    <span>{status}</span>
                </div>
            )}
            <div className="response-area">{response}</div>
        </div>
    );
}

export { askFrancisStreaming, exempleUtilisation, exempleAvecHistorique }; 