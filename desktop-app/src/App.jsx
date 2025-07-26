import React, { useState, useEffect, useRef } from 'react';
import francisLogo from './assets/francis-logo.svg';

const App = () => {
  // États principaux
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [extractedData, setExtractedData] = useState({});
  const [isMinimized, setIsMinimized] = useState(false);
  const recognitionRef = useRef(null);

  // Initialisation reconnaissance vocale permanente
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimText = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimText += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript + ' ');
          analyzeAndExtract(transcript + finalTranscript);
        }
        setInterimTranscript(interimText);
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      
      recognitionRef.current.onend = () => {
        // Redémarrage automatique pour écoute permanente
        setTimeout(() => {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.log('Redémarrage reconnaissance vocale');
          }
        }, 100);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Erreur reconnaissance vocale:', event.error);
      };

      // Démarrage automatique
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log('Démarrage automatique reconnaissance:', error);
        }
      }, 1000);
    }

    // Hotkeys
    if (window.electronAPI) {
      window.electronAPI.onGlobalHotkey((action) => {
        if (action === 'toggle-francis') {
          toggleMinimized();
        }
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Fonctions utilitaires
  const toggleMinimized = () => setIsMinimized(!isMinimized);
  
  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setExtractedData({});
  };

  const fillCurrentPage = async () => {
    if (!Object.values(extractedData).some(v => v)) return;
    
    try {
      if (window.electronAPI) {
        await window.electronAPI.injectData(extractedData);
        console.log('Données injectées:', extractedData);
      }
    } catch (error) {
      console.error('Erreur injection CRM:', error);
    }
  };

  // Analyser et extraire les données
  const analyzeAndExtract = (text) => {
    if (!text || text.length < 10) return;
    
    const data = {
      nom: extractName(text),
      age: extractAge(text),
      revenus: extractRevenue(text),
      situation: extractMaritalStatus(text)
    };
    
    const hasNewData = Object.entries(data).some(([key, value]) => 
      value && value !== extractedData[key]
    );
    
    if (hasNewData) {
      setExtractedData(prev => ({ ...prev, ...data }));
    }
  };

  // Extraction des données
  const extractName = (text) => {
    const patterns = [
      /(?:je m'appelle|mon nom est|je suis)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)/i,
      /client\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  const extractAge = (text) => {
    const match = text.match(/(\d+)\s+ans?\b/i);
    if (match) {
      const age = parseInt(match[1]);
      return (age >= 18 && age <= 100) ? age : null;
    }
    return null;
  };

  const extractRevenue = (text) => {
    const patterns = [
      /(\d+(?:\.\d{3})*(?:,\d+)?)\s*(?:euros?|€)/i,
      /revenus?\s+(?:de\s+)?(\d+(?:\.\d{3})*)/i,
      /gagne\s+(\d+(?:\.\d{3})*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseInt(match[1].replace(/\./g, '').replace(/,.*/, ''));
        return (amount >= 1000 && amount <= 10000000) ? amount : null;
      }
    }
    return null;
  };

  const extractMaritalStatus = (text) => {
    if (/marié|époux|épouse/i.test(text)) return 'Marié(e)';
    if (/célibataire|seul/i.test(text)) return 'Célibataire';
    if (/divorcé/i.test(text)) return 'Divorcé(e)';
    if (/veuf|veuve/i.test(text)) return 'Veuf/Veuve';
    return null;
  };

  // Vue minimisée - style Francis.ia
  if (isMinimized) {
    return (
      <div className="francis-minimized-francis" onClick={toggleMinimized}>
        <div className="mini-container">
          <div className="pulse-ring-francis"></div>
          <div className="mini-avatar">
            <img src={francisLogo} alt="Francis" className="mini-logo" />
          </div>
        </div>
      </div>
    );
  }

  // Interface principale - Style Francis.ia
  return (
    <div className="francis-app-ia">
      {/* Container principal avec backdrop blur comme Francis.ia */}
      <div className="francis-container">
        
        {/* Header avec logo - Style Francis.ia */}
        <div className="francis-header">
          <div className="header-content">
            <img src={francisLogo} alt="Francis" className="francis-logo" />
            <div className="header-text">
              <h1 className="francis-title">Francis</h1>
              <p className="francis-subtitle">Assistant CGP universel</p>
            </div>
          </div>
        </div>

        {/* Badge écoute active - Style Francis.ia */}
        <div className="listening-status">
          <div className="status-indicator">
            <div className="pulse-dot"></div>
            <span className="status-text">Écoute active</span>
          </div>
        </div>

        {/* Zone transcription - Style Francis.ia */}
        <div className="transcription-zone">
          <div className="transcript-content">
            {transcript && (
              <div className="transcript-final">{transcript}</div>
            )}
            {interimTranscript && (
              <div className="transcript-interim">
                {interimTranscript}<span className="cursor-blink">|</span>
              </div>
            )}
            {!transcript && !interimTranscript && (
              <div className="transcript-placeholder">
                Parlez, Francis vous écoute…
              </div>
            )}
          </div>
        </div>

        {/* Données extraites - Style Francis.ia */}
        {Object.values(extractedData).some(v => v) && (
          <div className="extracted-data">
            <h3 className="data-title">Informations détectées</h3>
            <div className="data-grid">
              {extractedData.nom && (
                <div className="data-card">
                  <div className="data-icon">👤</div>
                  <div className="data-content">
                    <span className="data-label">Client</span>
                    <span className="data-value">{extractedData.nom}</span>
                  </div>
                </div>
              )}
              {extractedData.age && (
                <div className="data-card">
                  <div className="data-icon">🎂</div>
                  <div className="data-content">
                    <span className="data-label">Âge</span>
                    <span className="data-value">{extractedData.age} ans</span>
                  </div>
                </div>
              )}
              {extractedData.revenus && (
                <div className="data-card">
                  <div className="data-icon">💰</div>
                  <div className="data-content">
                    <span className="data-label">Revenus</span>
                    <span className="data-value">{extractedData.revenus.toLocaleString()} €</span>
                  </div>
                </div>
              )}
              {extractedData.situation && (
                <div className="data-card">
                  <div className="data-icon">💍</div>
                  <div className="data-content">
                    <span className="data-label">Situation</span>
                    <span className="data-value">{extractedData.situation}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bouton CRM - Style Francis.ia */}
        <div className="crm-actions">
          <button 
            className={`btn-primary ${Object.values(extractedData).some(v => v) ? 'active' : 'disabled'}`}
            onClick={fillCurrentPage}
            disabled={!Object.values(extractedData).some(v => v)}
          >
            <span className="btn-icon">📋</span>
            <span className="btn-text">Remplir la page CRM</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>

        {/* Footer avec contrôles - Style Francis.ia */}
        <div className="francis-footer">
          <div className="controls">
            <button onClick={clearTranscript} className="control-btn" title="Effacer la transcription">
              <span>🗑️</span>
            </button>
            <button onClick={toggleMinimized} className="control-btn" title="Réduire Francis">
              <span>➖</span>
            </button>
          </div>
          <div className="help-text">
            <kbd>F8</kbd> pour masquer/afficher Francis
          </div>
        </div>

      </div>

      <style jsx>{`
        /* STYLE FRANCIS.IA - IDENTITÉ VISUELLE EXACTE */
        .francis-app-ia {
          width: 420px;
          min-height: 500px;
          background: linear-gradient(135deg, #1a2942 0%, #162238 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
          color: white;
          border-radius: 16px;
          overflow: hidden;
        }

        .francis-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(197, 165, 114, 0.2);
          border-radius: 16px;
          padding: 24px;
          margin: 8px;
          min-height: calc(100% - 16px);
        }

        /* Header - Style Francis.ia */
        .francis-header {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(197, 165, 114, 0.2);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .francis-logo {
          width: 48px;
          height: 48px;
          filter: drop-shadow(0 2px 8px rgba(197, 165, 114, 0.3));
        }

        .header-text {
          text-align: left;
        }

        .francis-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #c5a572, #e8cfa0);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: #c5a572;
        }

        .francis-subtitle {
          font-size: 14px;
          color: #9ca3af;
          margin: 2px 0 0 0;
          font-weight: 400;
        }

        /* Status écoute - Style Francis.ia */
        .listening-status {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(197, 165, 114, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid rgba(197, 165, 114, 0.3);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        .status-text {
          font-size: 13px;
          font-weight: 500;
          color: #10b981;
        }

        /* Zone transcription - Style Francis.ia */
        .transcription-zone {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(197, 165, 114, 0.2);
          border-radius: 12px;
          margin-bottom: 20px;
          overflow: hidden;
        }

        .transcript-content {
          padding: 16px;
          min-height: 100px;
          max-height: 200px;
          overflow-y: auto;
          font-size: 14px;
          line-height: 1.5;
        }

        .transcript-final {
          color: white;
          margin-bottom: 6px;
        }

        .transcript-interim {
          color: #9ca3af;
          font-style: italic;
        }

        .transcript-placeholder {
          color: #6b7280;
          font-style: italic;
          text-align: center;
          padding: 20px 0;
        }

        .cursor-blink {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* Données extraites - Style Francis.ia */
        .extracted-data {
          margin-bottom: 24px;
        }

        .data-title {
          font-size: 16px;
          font-weight: 600;
          color: #c5a572;
          margin: 0 0 12px 0;
          text-align: center;
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }

        .data-card {
          background: rgba(197, 165, 114, 0.1);
          border: 1px solid rgba(197, 165, 114, 0.2);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
        }

        .data-card:hover {
          background: rgba(197, 165, 114, 0.15);
          transform: translateY(-1px);
        }

        .data-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }

        .data-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .data-label {
          font-size: 11px;
          color: #9ca3af;
          text-transform: uppercase;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .data-value {
          font-size: 13px;
          color: white;
          font-weight: 500;
          margin-top: 2px;
        }

        /* Bouton CRM - Style Francis.ia */
        .crm-actions {
          margin-bottom: 20px;
        }

        .btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #c5a572, #e8cfa0);
          color: #0f172a;
          border: none;
          border-radius: 12px;
          padding: 16px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(197, 165, 114, 0.3);
        }

        .btn-primary.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(197, 165, 114, 0.4);
        }

        .btn-primary.disabled {
          background: rgba(107, 114, 128, 0.3);
          color: #6b7280;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-icon {
          font-size: 16px;
        }

        .btn-text {
          flex: 1;
        }

        .btn-arrow {
          font-size: 16px;
          font-weight: bold;
          transition: transform 0.2s ease;
        }

        .btn-primary.active:hover .btn-arrow {
          transform: translateX(3px);
        }

        /* Footer - Style Francis.ia */
        .francis-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid rgba(197, 165, 114, 0.2);
        }

        .controls {
          display: flex;
          gap: 8px;
        }

        .control-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(197, 165, 114, 0.2);
          border-radius: 6px;
          padding: 6px 8px;
          color: #9ca3af;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .control-btn:hover {
          background: rgba(197, 165, 114, 0.2);
          color: #c5a572;
        }

        .help-text {
          font-size: 11px;
          color: #6b7280;
        }

        .help-text kbd {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(197, 165, 114, 0.2);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 10px;
          color: #c5a572;
        }

        /* Vue minimisée - Style Francis.ia */
        .francis-minimized-francis {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 70px;
          height: 70px;
          cursor: pointer;
          z-index: 999999;
        }

        .mini-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pulse-ring-francis {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid #c5a572;
          border-radius: 50%;
          animation: pulsering 2s infinite;
        }

        @keyframes pulsering {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        .mini-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #1a2942, #162238);
          border: 2px solid #c5a572;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(197, 165, 114, 0.3);
          transition: all 0.3s ease;
        }

        .francis-minimized-francis:hover .mini-avatar {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(197, 165, 114, 0.4);
        }

        .mini-logo {
          width: 28px;
          height: 28px;
          filter: drop-shadow(0 2px 4px rgba(197, 165, 114, 0.3));
        }

        /* Scrollbar personnalisée - Style Francis.ia */
        .transcript-content::-webkit-scrollbar {
          width: 4px;
        }

        .transcript-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .transcript-content::-webkit-scrollbar-thumb {
          background: #c5a572;
          border-radius: 2px;
        }

        .transcript-content::-webkit-scrollbar-thumb:hover {
          background: #d4b583;
        }
      `}</style>
    </div>
  );
};

export default App;
