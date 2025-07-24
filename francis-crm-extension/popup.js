// Francis CRM Extension - Popup Logic
class FrancisPopup {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.lastResponse = null;
        this.apiUrl = 'https://fiscal.ia/api';
        this.apiKey = null;
        
        this.init();
    }

    async init() {
        await this.loadConfig();
        this.setupEventListeners();
        this.setupSpeechRecognition();
        await this.checkConnection();
        await this.detectCRM();
    }

    async loadConfig() {
        const config = await chrome.storage.sync.get(['apiUrl', 'apiKey']);
        this.apiUrl = config.apiUrl || 'https://fiscal.ia/api';
        this.apiKey = config.apiKey || null;
        
        document.getElementById('apiUrl').value = this.apiUrl;
        if (this.apiKey) {
            document.getElementById('apiKey').value = this.apiKey;
        }
    }

    setupEventListeners() {
        // Configuration
        document.getElementById('saveConfig').addEventListener('click', () => this.saveConfig());
        
        // Chat
        document.getElementById('sendBtn').addEventListener('click', () => this.sendQuestion());
        document.getElementById('questionInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendQuestion();
        });
        
        // Voice
        document.getElementById('voiceBtn').addEventListener('click', () => this.toggleVoiceRecognition());
        
        // Actions
        document.getElementById('injectBtn').addEventListener('click', () => this.injectToCRM());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyResponse());
    }

    async saveConfig() {
        const apiUrl = document.getElementById('apiUrl').value;
        const apiKey = document.getElementById('apiKey').value;
        
        await chrome.storage.sync.set({
            apiUrl: apiUrl,
            apiKey: apiKey
        });
        
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        
        this.showMessage('Configuration sauvegardée !', 'success');
        await this.checkConnection();
    }

    async checkConnection() {
        const statusEl = document.getElementById('connectionStatus');
        const statusDot = statusEl.querySelector('.status-dot');
        const statusText = statusEl.querySelector('span');
        
        try {
            const response = await fetch(`${this.apiUrl}/health`, {
                method: 'GET',
                headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
            });
            
            if (response.ok) {
                statusDot.className = 'status-dot connected';
                statusText.textContent = 'Connecté';
                document.getElementById('configSection').style.display = 'none';
                document.getElementById('chatSection').style.display = 'block';
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            statusDot.className = 'status-dot disconnected';
            statusText.textContent = 'Déconnecté';
            document.getElementById('configSection').style.display = 'block';
            document.getElementById('chatSection').style.display = 'none';
        }
    }

    async detectCRM() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const url = new URL(tab.url);
            const hostname = url.hostname;
            
            let crmName = null;
            if (hostname.includes('salesforce.com')) crmName = 'Salesforce';
            else if (hostname.includes('hubspot.com')) crmName = 'HubSpot';
            else if (hostname.includes('pipedrive.com')) crmName = 'Pipedrive';
            else if (hostname.includes('zoho.com')) crmName = 'Zoho CRM';
            else if (hostname.includes('monday.com')) crmName = 'Monday.com';
            else if (hostname.includes('airtable.com')) crmName = 'Airtable';
            else if (hostname.includes('notion.so')) crmName = 'Notion';
            else if (hostname.includes('clickup.com')) crmName = 'ClickUp';
            
            if (crmName) {
                const crmInfo = document.getElementById('crmInfo');
                const crmInfoText = document.getElementById('crmInfoText');
                crmInfoText.textContent = `${crmName} détecté ! Francis peut injecter directement vos réponses.`;
                crmInfo.style.display = 'block';
            }
        } catch (error) {
            console.log('Could not detect CRM:', error);
        }
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'fr-FR';
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.updateVoiceUI();
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('questionInput').value = transcript;
            };
            
            this.recognition.onend = () => {
                this.isRecording = false;
                this.updateVoiceUI();
                
                // Auto-send if we got a result
                const question = document.getElementById('questionInput').value.trim();
                if (question) {
                    setTimeout(() => this.sendQuestion(), 500);
                }
            };
            
            this.recognition.onerror = (event) => {
                this.isRecording = false;
                this.updateVoiceUI();
                this.showMessage(`Erreur vocale: ${event.error}`, 'error');
            };
        } else {
            document.getElementById('voiceBtn').style.display = 'none';
            this.showMessage('Reconnaissance vocale non supportée', 'warning');
        }
    }

    toggleVoiceRecognition() {
        if (!this.recognition) return;
        
        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    updateVoiceUI() {
        const voiceBtn = document.getElementById('voiceBtn');
        const micIcon = voiceBtn.querySelector('.mic-icon');
        const micOffIcon = voiceBtn.querySelector('.mic-off-icon');
        const voiceFeedback = document.getElementById('voiceFeedback');
        
        if (this.isRecording) {
            voiceBtn.classList.add('recording');
            micIcon.style.display = 'none';
            micOffIcon.style.display = 'block';
            voiceFeedback.style.display = 'flex';
        } else {
            voiceBtn.classList.remove('recording');
            micIcon.style.display = 'block';
            micOffIcon.style.display = 'none';
            voiceFeedback.style.display = 'none';
        }
    }

    async sendQuestion() {
        const question = document.getElementById('questionInput').value.trim();
        if (!question) return;
        
        this.showLoading(true);
        this.addMessage(question, 'user');
        document.getElementById('questionInput').value = '';
        
        try {
            const response = await fetch(`${this.apiUrl}/test-francis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
                },
                body: JSON.stringify({ question })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            this.lastResponse = data.response || 'Aucune réponse reçue';
            
            this.addMessage(this.lastResponse, 'assistant');
            this.enableActionButtons();
            
        } catch (error) {
            const errorMsg = `Erreur: ${error.message}`;
            this.addMessage(errorMsg, 'error');
            this.showMessage('Erreur lors de la communication avec Francis', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    addMessage(content, type) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        
        const time = new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageEl.innerHTML = `
            <div class="message-content">
                <p>${content}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    enableActionButtons() {
        document.getElementById('injectBtn').disabled = false;
        document.getElementById('copyBtn').disabled = false;
    }

    async injectToCRM() {
        if (!this.lastResponse) return;
        
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (response) => {
                    // Find active text field or textarea
                    const activeElement = document.activeElement;
                    let targetField = null;
                    
                    if (activeElement && (activeElement.tagName === 'TEXTAREA' || 
                        (activeElement.tagName === 'INPUT' && activeElement.type === 'text'))) {
                        targetField = activeElement;
                    } else {
                        // Look for common CRM text fields
                        const selectors = [
                            'textarea[name*="description"]',
                            'textarea[name*="comment"]', 
                            'textarea[name*="note"]',
                            'textarea[name*="body"]',
                            'input[name*="subject"]',
                            'div[contenteditable="true"]',
                            '.ql-editor', // Quill editor
                            '.fr-element', // Froala editor
                            '[data-testid*="text"]'
                        ];
                        
                        for (const selector of selectors) {
                            targetField = document.querySelector(selector);
                            if (targetField) break;
                        }
                    }
                    
                    if (targetField) {
                        if (targetField.tagName === 'DIV' || targetField.contentEditable === 'true') {
                            // Rich text editor
                            targetField.innerHTML += response;
                            targetField.dispatchEvent(new Event('input', { bubbles: true }));
                        } else {
                            // Regular input/textarea
                            const currentValue = targetField.value;
                            targetField.value = currentValue + (currentValue ? '\n\n' : '') + response;
                            targetField.dispatchEvent(new Event('input', { bubbles: true }));
                            targetField.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        
                        // Highlight the field briefly
                        targetField.style.outline = '3px solid #c5a572';
                        targetField.style.outlineOffset = '2px';
                        setTimeout(() => {
                            targetField.style.outline = '';
                            targetField.style.outlineOffset = '';
                        }, 2000);
                        
                        return true;
                    }
                    return false;
                },
                args: [this.lastResponse]
            });
            
            this.showMessage('Réponse injectée avec succès !', 'success');
            
        } catch (error) {
            this.showMessage('Erreur lors de l\'injection', 'error');
            console.error('Injection error:', error);
        }
    }

    async copyResponse() {
        if (!this.lastResponse) return;
        
        try {
            await navigator.clipboard.writeText(this.lastResponse);
            this.showMessage('Réponse copiée !', 'success');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.lastResponse;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showMessage('Réponse copiée !', 'success');
        }
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    }

    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `notification ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 12px;
        `;
        
        document.body.appendChild(messageEl);
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FrancisPopup();
});
