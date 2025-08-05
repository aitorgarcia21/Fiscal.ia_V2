const https = require('https');

const SUPABASE_URL = 'https://lqxfjjtjxktjgpekugtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeGZqanRqeGt0amdwZWt1Z3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTgyMDMsImV4cCI6MjA2MzM3NDIwM30.-E66kbBxRAVcJcPdhhUJWq5BZB-2GRpiBEaGtiWLVrA';

// Credentials à tester
const email = 'aitorgarcia2112@gmail.com';
const password = '21AiPa01....';

console.log('🔐 Test de connexion directe à Supabase...');
console.log(`Email: ${email}`);
console.log(`Password length: ${password.length}`);

const testLogin = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email,
      password,
      gotrue_meta_security: {}
    });

    const options = {
      hostname: 'lqxfjjtjxktjgpekugtf.supabase.co',
      path: '/auth/v1/token?grant_type=password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('\n📡 Envoi de la requête...');
    const req = https.request(options, (res) => {
      console.log(`\n📥 Status: ${res.statusCode}`);
      console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('\n📄 Response body:');
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            console.log('✅ CONNEXION RÉUSSIE!');
            console.log('User ID:', parsed.user?.id);
            console.log('Email:', parsed.user?.email);
            console.log('Access token:', parsed.access_token.substring(0, 20) + '...');
          } else {
            console.log('❌ ERREUR:', JSON.stringify(parsed, null, 2));
          }
        } catch (e) {
          console.log('Raw response:', data);
        }
        resolve(res.statusCode);
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erreur réseau:', e.message);
      reject(e);
    });

    req.setTimeout(10000, () => {
      console.error('❌ Timeout après 10 secondes');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(postData);
    req.end();
  });
};

// Exécuter le test
testLogin()
  .then(() => console.log('\n✅ Test terminé'))
  .catch(err => console.error('\n❌ Test échoué:', err.message));
