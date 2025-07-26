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

  // Vue minimisée
  if (isMinimized) {
    return (
      <div className="francis-minimized" onClick={toggleMinimized}>
        <div className="francis-mini">
          <div className="pulse"></div>
          <img src={francisLogo} alt="Francis" className="mini-logo" />
        </div>
      </div>
    );
  }

  // Interface principale - ULTRA SIMPLE
  return (
    <div className="francis-app-simple">
      {/* Header simple */}
      <div className="francis-header-simple">
        <img src={francisLogo} alt="Francis" className="francis-logo-simple" />
        <h1 className="francis-title-simple">Francis</h1>
        <div className="francis-subtitle-simple">Assistant CGP</div>
      </div>

      {/* Statut écoute */}
      <div className="francis-status-simple">
        <div className="status-dot"></div>
        <span>Écoute active</span>
      </div>

      {/* Transcription */}
      <div className="francis-transcript-simple">
        {transcript && (
          <div className="transcript-final">{transcript}</div>
        )}
        {interimTranscript && (
          <div className="transcript-interim">
            {interimTranscript}<span className="cursor">|</span>
          </div>
        )}
        {!transcript && !interimTranscript && (
          <div className="transcript-placeholder">
            Parlez, Francis écoute…
          </div>
        )}
      </div>

      {/* Données extraites */}
      {Object.values(extractedData).some(v => v) && (
        <div className="francis-data-simple">
          {extractedData.nom && (
            <div className="data-item">👤 {extractedData.nom}</div>
          )}
          {extractedData.age && (
            <div className="data-item">🎂 {extractedData.age} ans</div>
          )}
          {extractedData.revenus && (
            <div className="data-item">💰 {extractedData.revenus.toLocaleString()} €</div>
          )}
          {extractedData.situation && (
            <div className="data-item">💍 {extractedData.situation}</div>
          )}
        </div>
      )}

      {/* Actions simples */}
      <div className="francis-actions-simple">
        <button 
          className={`fill-button ${Object.values(extractedData).some(v => v) ? 'active' : 'disabled'}`}
          onClick={fillCurrentPage}
          disabled={!Object.values(extractedData).some(v => v)}
        >
          📋 Remplir la page
        </button>
      </div>

      {/* Contrôles discrets */}
      <div className="francis-controls-simple">
        <button onClick={clearTranscript} className="control-btn" title="Effacer">
          🗑️
        </button>
        <button onClick={toggleMinimized} className="control-btn" title="Réduire">
          ➖
        </button>
      </div>

      {/* Aide */}
      <div className="francis-help-simple">
        F8 pour masquer/afficher
      </div>

      <style jsx>{`
        /* FRANCIS ULTRA SIMPLE - PAS DE GLASSMORPHISM */
        .francis-app-simple {
          width: 320px;
          height: auto;
          background: #1a1a1a;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #333;
        }

        .francis-header-simple {
          text-align: center;
          margin-bottom: 20px;
        }

        .francis-logo-simple {
          width: 48px;
          height: 48px;
          margin-bottom: 8px;
        }

        .francis-title-simple {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #c5a572;
        }

        .francis-subtitle-simple {
          font-size: 14px;
          color: #888;
          margin: 0;
        }

        .francis-status-simple {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          color: #4CAF50;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #4CAF50;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }

        .francis-transcript-simple {
          min-height: 80px;
          max-height: 200px;
          overflow-y: auto;
          background: #2a2a2a;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 16px;
          font-size: 14px;
          line-height: 1.4;
        }

        .transcript-final {
          color: #ffffff;
          margin-bottom: 4px;
        }

        .transcript-interim {
          color: #888;
          font-style: italic;
        }

        .transcript-placeholder {
          color: #666;
          font-style: italic;
        }

        .cursor {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .francis-data-simple {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .data-item {
          background: #2a2a2a;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 13px;
          color: #c5a572;
        }

        .francis-actions-simple {
          margin-bottom: 16px;
        }

        .fill-button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fill-button.active {
          background: #c5a572;
          color: #1a1a1a;
        }

        .fill-button.active:hover {
          background: #d4b584;
        }

        .fill-button.disabled {
          background: #333;
          color: #666;
          cursor: not-allowed;
        }

        .francis-controls-simple {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 12px;
        }

        .control-btn {
          background: #2a2a2a;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 8px;
          color: #888;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .control-btn:hover {
          background: #333;
          color: #c5a572;
        }

        .francis-help-simple {
          text-align: center;
          font-size: 11px;
          color: #666;
        }

        /* Vue minimisée */
        .francis-minimized {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          cursor: pointer;
          z-index: 999999;
        }

        .francis-mini {
          position: relative;
          width: 100%;
          height: 100%;
          background: #1a1a1a;
          border: 2px solid #c5a572;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pulse {
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

        .mini-logo {
          width: 24px;
          height: 24px;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default App;
