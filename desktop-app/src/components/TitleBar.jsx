import React, { useState, useEffect } from 'react';
import { FiMinus, FiMaximize2, FiX } from 'react-icons/fi';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDraggable, setIsDraggable] = useState(true);

  useEffect(() => {
    if (window.electronAPI) {
      // Écouter les changements d'état de la fenêtre
      const handleWindowState = (state) => {
        setIsMaximized(state.isMaximized);
      };
      
      window.electronAPI.onWindowState(handleWindowState);
      
      // Récupérer l'état initial
      const checkMaximized = async () => {
        const maximized = await window.electronAPI.isMaximized();
        setIsMaximized(maximized);
      };
      
      checkMaximized();
      
      return () => {
        // Nettoyer l'écouteur d'événements
        if (window.electronAPI.offWindowState) {
          window.electronAPI.offWindowState(handleWindowState);
        }
      };
    }
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <div 
      className={`title-bar ${isDraggable ? 'draggable' : ''}`}
      onDoubleClick={handleMaximize}
    >
      <div className="title-bar-drag-region">
        <div className="title">Francis</div>
      </div>
      
      <div className="window-controls">
        <button 
          className="window-control window-minimize"
          onClick={handleMinimize}
          title="Minimiser"
        >
          <FiMinus size={14} />
        </button>
        
        <button 
          className={`window-control window-maximize ${isMaximized ? 'restore' : ''}`}
          onClick={handleMaximize}
          title={isMaximized ? "Restaurer" : "Maximiser"}
        >
          <FiMaximize2 size={12} />
        </button>
        
        <button 
          className="window-control window-close"
          onClick={handleClose}
          title="Fermer"
        >
          <FiX size={16} />
        </button>
      </div>
      
      <style jsx>{`
        .title-bar {
          height: 32px;
          background: #162238;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          -webkit-app-region: drag;
          user-select: none;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
        
        .title-bar-drag-region {
          flex: 1;
          display: flex;
          align-items: center;
          height: 100%;
          -webkit-app-region: drag;
        }
        
        .title {
          color: #c5a572;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
        }
        
        .window-controls {
          display: flex;
          -webkit-app-region: no-drag;
        }
        
        .window-control {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c5a572;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          border-radius: 4px;
        }
        
        .window-control:hover {
          background: rgba(197, 165, 114, 0.1);
        }
        
        .window-close:hover {
          background: #e74c3c;
          color: white;
        }
        
        .window-maximize.restore {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
};

export default TitleBar;
