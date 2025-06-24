from flask import Flask, render_template, request, jsonify
import os
from assistant_fiscal import get_assistant_response
import logging
import tempfile
from whisper_service import transcribe_audio_file

# Configuration du logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

@app.route('/')
def home():
    logger.debug("Accès à la page d'accueil")
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    question = request.json.get('question', '')
    logger.debug(f"Question reçue : {question}")
    try:
        response = get_assistant_response(question)
        logger.debug(f"Réponse générée : {response[:100]}...")
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Erreur : {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/transcribe-audio', methods=['POST'])
def transcribe_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'Aucun fichier audio fourni'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'Aucun fichier sélectionné'}), 400
        
        # Sauvegarder temporairement le fichier audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            audio_file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            # Transcrire l'audio
            transcription = transcribe_audio_file(temp_path)
            return jsonify({'transcription': transcription})
        finally:
            # Nettoyer le fichier temporaire
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        logger.error(f"Erreur lors de la transcription : {str(e)}")
        return jsonify({'error': f'Erreur lors de la transcription : {str(e)}'}), 500

if __name__ == '__main__':
    logger.info("Démarrage de l'application Flask")
    app.run(debug=True, host='127.0.0.1', port=8080) 