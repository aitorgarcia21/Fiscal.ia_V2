from flask import Flask, render_template, request, jsonify
import os
from assistant_fiscal import get_assistant_response
import logging

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

if __name__ == '__main__':
    logger.info("Démarrage de l'application Flask")
    app.run(debug=True, host='127.0.0.1', port=8080) 