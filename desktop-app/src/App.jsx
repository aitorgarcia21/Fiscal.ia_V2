import React from 'react';
import TitleBar from './components/TitleBar';

const App = () => {
  return (
    <div className="app">
      <TitleBar />
      <div className="content">
        <div className="francis-overlay">
          <div className="francis-logo">
            <h2>Francis</h2>
            <p>Copilote des CGP</p>
          </div>
          <iframe 
            src="https://fiscal-ia-v2-production.up.railway.app"
            className="webview"
            title="Francis Web App"
            allow="clipboard-read; clipboard-write;"
          />
        </div>
      </div>
      
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        html, body, #root {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #162238;
        }
        
        .app {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #162238;
          border-radius: 8px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          border: 2px solid #c5a572;
        }
        
        .content {
          flex: 1;
          display: flex;
          overflow: hidden;
          background: #162238;
        }
        
        .francis-overlay {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .francis-logo {
          background: #c5a572;
          color: #162238;
          text-align: center;
          padding: 20px;
          border-radius: 8px;
          margin: 10px;
        }
        
        .francis-logo h2 {
          margin: 0 0 5px 0;
          font-size: 24px;
          font-weight: bold;
        }
        
        .francis-logo p {
          margin: 0;
          font-size: 14px;
          opacity: 0.8;
        }
        
        .webview {
          flex: 1;
          border: none;
          background: white;
          margin: 10px;
          border-radius: 8px;
        }
        
        .offline-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 20px;
          text-align: center;
          color: #666;
        }
        
        .offline-message h3 {
          margin-bottom: 10px;
          color: #162238;
        }
      `}</style>
    </div>
  );
};

export default App;
