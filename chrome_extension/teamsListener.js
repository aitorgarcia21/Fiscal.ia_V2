// Francis Teams Assistant - Extension Chrome spécialisée
class FrancisTeamsListener {
  constructor() {
    this.isListening = false;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.transcriptionBuffer = '';
    this.francisAPI = 'https://api.francis.ai/api/pro/teams-assistant';
    this.teamsElements = {};
    this.initializeTeamsIntegration();
  }

  initializeTeamsIntegration() {
    // Attendre que Teams soit chargé
    this.waitForTeamsLoad();
    this.createFrancisTeamsOverlay();
    this.setupTeamsEventListeners();
  }

  waitForTeamsLoad() {
    const checkTeamsLoaded = () => {
      // Vérifier si on est sur Teams
      if (window.location.href.includes('teams.microsoft.com')) {
        console.log('Francis détecte Microsoft Teams');
        this.detectTeamsElements();
      } else {
        setTimeout(checkTeamsLoaded, 1000);
      }
    };
    checkTeamsLoaded();
  }

  detectTeamsElements() {
    // Détecter les éléments Teams pour l'intégration
    this.teamsElements = {
      meetingContainer: document.querySelector('[data-testid="meeting-container"]'),
      chatPanel: document.querySelector('[data-testid="chat-panel"]'),
      participantsPanel: document.querySelector('[data-testid="participants-panel"]'),
      meetingControls: document.querySelector('[data-testid="meeting-controls"]')
    };
  }

  createFrancisTeamsOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'francis-teams-overlay';
    overlay.innerHTML = `
      <div class="francis-teams-controls">
        <div class="francis-teams-header">
          <div class="francis-logo">
            <span class="francis-icon">💰</span>
            <span class="francis-text">Francis</span>
          </div>
          <button id="francis-teams-listen-btn" class="francis-teams-btn">
            <span class="francis-btn-icon">🎤</span>
            <span class="francis-btn-text">Activer Francis</span>
          </button>
        </div>
        
        <div id="francis-teams-status" class="francis-teams-status hidden">
          <div class="francis-listening-indicator">
            <div class="francis-pulse-dot"></div>
            <span>Francis écoute...</span>
          </div>
        </div>
        
        <div id="francis-teams-suggestions" class="francis-teams-suggestions hidden">
          <div class="francis-suggestions-header">
            <span class="francis-suggestions-title">💡 Suggestions Francis</span>
            <button id="francis-clear-suggestions" class="francis-clear-btn">×</button>
          </div>
          <div id="francis-suggestions-content" class="francis-suggestions-content"></div>
        </div>
        
        <div id="francis-teams-transcription" class="francis-teams-transcription hidden">
          <div class="francis-transcription-header">
            <span>📝 Transcription en cours</span>
            <button id="francis-copy-transcription" class="francis-copy-btn">📋</button>
          </div>
          <div id="francis-transcription-content" class="francis-transcription-content"></div>
        </div>
      </div>
    `;
    
    // Styles CSS spécifiques Teams
    const styles = `
      <style>
        .francis-teams-controls {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          background: rgba(22, 34, 56, 0.98);
          border: 2px solid #c5a572;
          border-radius: 12px;
          padding: 16px;
          backdrop-filter: blur(15px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          min-width: 320px;
          max-width: 400px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .francis-teams-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .francis-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #c5a572;
          font-weight: bold;
          font-size: 16px;
        }
        
        .francis-teams-btn {
          background: linear-gradient(135deg, #c5a572, #e8cfa0);
          color: #162238;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-size: 14px;
        }
        
        .francis-teams-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(197, 165, 114, 0.4);
        }
        
        .francis-teams-btn.listening {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
        }
        
        .francis-teams-status {
          margin: 12px 0;
          padding: 8px 12px;
          background: rgba(197, 165, 114, 0.1);
          border-radius: 6px;
          border-left: 3px solid #c5a572;
        }
        
        .francis-listening-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #c5a572;
          font-size: 14px;
          font-weight: 500;
        }
        
        .francis-pulse-dot {
          width: 10px;
          height: 10px;
          background: #e74c3c;
          border-radius: 50%;
          animation: francis-pulse 1.5s infinite;
        }
        
        @keyframes francis-pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .francis-teams-suggestions {
          margin: 12px 0;
          background: rgba(197, 165, 114, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(197, 165, 114, 0.2);
          overflow: hidden;
        }
        
        .francis-suggestions-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(197, 165, 114, 0.1);
          border-bottom: 1px solid rgba(197, 165, 114, 0.2);
        }
        
        .francis-suggestions-title {
          color: #c5a572;
          font-weight: 600;
          font-size: 14px;
        }
        
        .francis-clear-btn {
          background: none;
          border: none;
          color: #c5a572;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }
        
        .francis-clear-btn:hover {
          background: rgba(197, 165, 114, 0.2);
        }
        
        .francis-suggestions-content {
          padding: 12px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .francis-suggestion-item {
          padding: 8px 0;
          border-bottom: 1px solid rgba(197, 165, 114, 0.1);
          color: #e8e8e8;
          font-size: 13px;
          line-height: 1.4;
        }
        
        .francis-suggestion-item:last-child {
          border-bottom: none;
        }
        
        .francis-teams-transcription {
          margin: 12px 0;
          background: rgba(88, 192, 208, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(88, 192, 208, 0.2);
        }
        
        .francis-transcription-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgba(88, 192, 208, 0.1);
          border-bottom: 1px solid rgba(88, 192, 208, 0.2);
        }
        
        .francis-copy-btn {
          background: none;
          border: none;
          color: #88C0D0;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        
        .francis-copy-btn:hover {
          background: rgba(136, 192, 208, 0.2);
        }
        
        .francis-transcription-content {
          padding: 12px;
          max-height: 150px;
          overflow-y: auto;
          color: #e8e8e8;
          font-size: 12px;
          line-height: 1.3;
          font-family: 'Consolas', 'Monaco', monospace;
        }
        
        .hidden { display: none; }
        
        /* Scrollbar personnalisée */
        .francis-suggestions-content::-webkit-scrollbar,
        .francis-transcription-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .francis-suggestions-content::-webkit-scrollbar-track,
        .francis-transcription-content::-webkit-scrollbar-track {
          background: rgba(197, 165, 114, 0.1);
          border-radius: 3px;
        }
        
        .francis-suggestions-content::-webkit-scrollbar-thumb,
        .francis-transcription-content::-webkit-scrollbar-thumb {
          background: rgba(197, 165, 114, 0.3);
          border-radius: 3px;
        }
        
        .francis-suggestions-content::-webkit-scrollbar-thumb:hover,
        .francis-transcription-content::-webkit-scrollbar-thumb:hover {
          background: rgba(197, 165, 114, 0.5);
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
    document.body.appendChild(overlay);
    
    // Event listeners
    this.setupFrancisEventListeners();
  }

  setupFrancisEventListeners() {
    document.getElementById('francis-teams-listen-btn').addEventListener('click', () => {
      this.toggleListening();
    });
    
    document.getElementById('francis-clear-suggestions').addEventListener('click', () => {
      this.clearSuggestions();
    });
    
    document.getElementById('francis-copy-transcription').addEventListener('click', () => {
      this.copyTranscription();
    });
  }

  setupTeamsEventListeners() {
    // Écouter les changements dans Teams
    const observer = new MutationObserver(() => {
      this.detectTeamsElements();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      await this.startListening();
    }
  }

  async startListening() {
    try {
      // Demander l'accès au microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });

      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      
      // Créer un MediaRecorder pour capturer l'audio
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.processAudioChunk();
      };

      // Démarrer l'enregistrement par chunks de 3 secondes
      this.mediaRecorder.start(3000);
      this.isListening = true;
      this.updateTeamsUI(true);
      
      console.log('Francis écoute maintenant la conversation Teams...');
      
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'écoute Teams:', error);
      alert('Francis ne peut pas accéder au microphone. Vérifiez les permissions Teams.');
    }
  }

  stopListening() {
    if (this.mediaRecorder && this.isListening) {
      this.mediaRecorder.stop();
      this.isListening = false;
      this.updateTeamsUI(false);
      console.log('Francis a arrêté d\'écouter Teams.');
    }
  }

  async processAudioChunk() {
    if (this.audioChunks.length === 0) return;

    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    this.audioChunks = [];

    try {
      // Envoyer l'audio à Francis pour transcription
      const transcription = await this.sendAudioToFrancis(audioBlob);
      
      if (transcription) {
        this.transcriptionBuffer += transcription + ' ';
        this.updateTranscriptionDisplay();
        
        // Analyser le contexte et générer des suggestions
        if (this.transcriptionBuffer.length > 150) {
          await this.analyzeTeamsConversation();
          this.transcriptionBuffer = ''; // Reset buffer
        }
      }
    } catch (error) {
      console.error('Erreur lors du traitement audio Teams:', error);
    }

    // Continuer l'enregistrement si toujours en mode écoute
    if (this.isListening && this.mediaRecorder) {
      this.mediaRecorder.start(3000);
    }
  }

  async sendAudioToFrancis(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'teams_conversation.webm');
    formData.append('platform', 'teams');
    formData.append('timestamp', Date.now().toString());

    try {
      const response = await fetch(this.francisAPI, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getFrancisToken()}`,
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        return result.transcription;
      }
    } catch (error) {
      console.error('Erreur API Francis Teams:', error);
    }
    
    return null;
  }

  async analyzeTeamsConversation() {
    try {
      const response = await fetch(`${this.francisAPI}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getFrancisToken()}`,
        },
        body: JSON.stringify({
          transcription: this.transcriptionBuffer,
          context: 'teams-meeting',
          platform: 'teams'
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        this.displayTeamsSuggestions(analysis.suggestions);
      }
    } catch (error) {
      console.error('Erreur analyse conversation Teams:', error);
    }
  }

  displayTeamsSuggestions(suggestions) {
    const container = document.getElementById('francis-suggestions-content');
    const suggestionsDiv = document.getElementById('francis-teams-suggestions');
    
    if (suggestions && suggestions.length > 0) {
      container.innerHTML = suggestions.map(suggestion => 
        `<div class="francis-suggestion-item">💡 ${suggestion}</div>`
      ).join('');
      suggestionsDiv.classList.remove('hidden');
    }
  }

  updateTranscriptionDisplay() {
    const container = document.getElementById('francis-transcription-content');
    const transcriptionDiv = document.getElementById('francis-teams-transcription');
    
    if (this.transcriptionBuffer) {
      container.textContent = this.transcriptionBuffer;
      transcriptionDiv.classList.remove('hidden');
    }
  }

  clearSuggestions() {
    const container = document.getElementById('francis-suggestions-content');
    const suggestionsDiv = document.getElementById('francis-teams-suggestions');
    
    container.innerHTML = '';
    suggestionsDiv.classList.add('hidden');
  }

  copyTranscription() {
    if (this.transcriptionBuffer) {
      navigator.clipboard.writeText(this.transcriptionBuffer).then(() => {
        // Feedback visuel
        const copyBtn = document.getElementById('francis-copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '✓';
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 1000);
      });
    }
  }

  updateTeamsUI(isListening) {
    const btn = document.getElementById('francis-teams-listen-btn');
    const status = document.getElementById('francis-teams-status');
    
    if (isListening) {
      btn.classList.add('listening');
      btn.innerHTML = '<span class="francis-btn-icon">⏹️</span><span class="francis-btn-text">Arrêter Francis</span>';
      status.classList.remove('hidden');
    } else {
      btn.classList.remove('listening');
      btn.innerHTML = '<span class="francis-btn-icon">🎤</span><span class="francis-btn-text">Activer Francis</span>';
      status.classList.add('hidden');
    }
  }

  getFrancisToken() {
    return localStorage.getItem('francis_token') || '';
  }
}

// Initialiser Francis Teams
if (window.location.href.includes('teams.microsoft.com')) {
  console.log('Francis Teams Assistant initialisé');
  new FrancisTeamsListener();
} 