import React, { useState } from 'react';

export default function EmailCollectorPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email:', email);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEmail('');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0A192F 0%, #162238 50%, #1E3A8A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Francis
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            Votre copilote fiscal intelligent
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #c5a572, #d4b982)',
                color: '#0A192F',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Rejoindre la liste
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              Merci !
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '16px' }}>
              Email enregistré avec succès !
            </p>
            <button onClick={handleReset} style={{ color: '#c5a572', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
              Ajouter un autre email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
