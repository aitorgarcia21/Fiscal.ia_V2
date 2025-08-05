const https = require('https');

const SUPABASE_URL = 'https://lqxfjjtjxktjgpekugtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA';

console.log('🔍 Test de connexion à Supabase...');
console.log('URL:', SUPABASE_URL);

// Test 1: Ping l'API REST
const testRest = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'lqxfjjtjxktjgpekugtf.supabase.co',
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    console.log('\n📡 Test 1: API REST...');
    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Response:', data.substring(0, 200));
        resolve(res.statusCode);
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erreur:', e.message);
      reject(e);
    });

    req.setTimeout(5000, () => {
      console.error('❌ Timeout après 5 secondes');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

// Test 2: Test Auth Health
const testAuth = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'lqxfjjtjxktjgpekugtf.supabase.co',
      path: '/auth/v1/health',
      method: 'GET'
    };

    console.log('\n🔐 Test 2: Auth Health...');
    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('Response:', data);
        resolve(res.statusCode);
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erreur:', e.message);
      reject(e);
    });

    req.setTimeout(5000, () => {
      console.error('❌ Timeout après 5 secondes');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

// Exécuter les tests
(async () => {
  try {
    await testRest();
    await testAuth();
    console.log('\n✅ Tests terminés');
  } catch (error) {
    console.error('\n❌ Échec des tests:', error.message);
  }
})();
