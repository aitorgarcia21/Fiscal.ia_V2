"""
ROUTES API POUR FRANCIS PARTICULIER INDÉPENDANT
===============================================
DÉSACTIVÉ TEMPORAIREMENT - Flask non disponible sur Railway
Ce fichier est temporairement désactivé pour éviter l'erreur:
ModuleNotFoundError: No module named 'flask'

Le backend utilise FastAPI uniquement.
"""

# Placeholder pour éviter erreur d'import dans main.py
francis_particulier_bp = None
@francis_particulier_bp.route('/api/francis-particulier/query', methods=['POST'])
def francis_particulier_query():
    """
    Endpoint principal pour les questions fiscales particuliers
    
    Body JSON:
    {
        "query": "Ma question fiscale",
        "user_profile": {
            "annual_income": 75000,
            "country": "FR",
            "marital_status": "single"
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                "error": "Paramètre 'query' requis",
                "status": "error"
            }), 400
        
        query = data['query']
        user_profile = data.get('user_profile', {})
        
        # Génération de la réponse
        response_data = francis_particulier.generate_response(query, user_profile)
        
        return jsonify({
            "status": "success",
            "response": response_data["response"],
            "metadata": {
                "type": response_data.get("type", "unknown"),
                "confidence": response_data.get("confidence", 0.0),
                "analysis_method": response_data.get("analysis_method", "basic"),
                "enriched_by_llm": response_data.get("enriched_by_llm", False)
            },
            "data": {
                k: v for k, v in response_data.items() 
                if k not in ["response", "type", "confidence"]
            }
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Erreur lors du traitement: {str(e)}",
            "status": "error"
        }), 500

@francis_particulier_bp.route('/api/francis-particulier/calculate-tax', methods=['POST'])
def calculate_tax():
    """
    Endpoint pour calculs d'impôts directs
    
    Body JSON:
    {
        "country": "FR",
        "annual_income": 75000,
        "marital_status": "single"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'country' not in data or 'annual_income' not in data:
            return jsonify({
                "error": "Paramètres 'country' et 'annual_income' requis",
                "status": "error"
            }), 400
        
        country = data['country']
        annual_income = float(data['annual_income'])
        marital_status = data.get('marital_status', 'single')
        
        # Calcul de l'impôt
        tax_calculation = francis_particulier.knowledge_base.calculate_income_tax(
            country, annual_income, marital_status
        )
        
        if "error" in tax_calculation:
            return jsonify({
                "error": tax_calculation["error"],
                "status": "error"
            }), 400
        
        return jsonify({
            "status": "success",
            "calculation": tax_calculation
        })
        
    except ValueError as e:
        return jsonify({
            "error": f"Montant invalide: {str(e)}",
            "status": "error"
        }), 400
    except Exception as e:
        return jsonify({
            "error": f"Erreur lors du calcul: {str(e)}",
            "status": "error"
        }), 500

@francis_particulier_bp.route('/api/francis-particulier/compare-countries', methods=['POST'])
def compare_countries():
    """
    Endpoint pour comparaison fiscale entre pays
    
    Body JSON:
    {
        "annual_income": 75000,
        "countries": ["FR", "DE", "CH", "AD", "LU"]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'annual_income' not in data:
            return jsonify({
                "error": "Paramètre 'annual_income' requis",
                "status": "error"
            }), 400
        
        annual_income = float(data['annual_income'])
        countries = data.get('countries', ["FR", "DE", "CH", "AD", "LU"])
        
        # Comparaison entre pays
        comparison = francis_particulier.knowledge_base.compare_countries(
            annual_income, countries
        )
        
        return jsonify({
            "status": "success",
            "comparison": comparison
        })
        
    except ValueError as e:
        return jsonify({
            "error": f"Montant invalide: {str(e)}",
            "status": "error"
        }), 400
    except Exception as e:
        return jsonify({
            "error": f"Erreur lors de la comparaison: {str(e)}",
            "status": "error"
        }), 500

@francis_particulier_bp.route('/api/francis-particulier/optimization-advice', methods=['POST'])
def optimization_advice():
    """
    Endpoint pour conseils d'optimisation fiscale
    
    Body JSON:
    {
        "annual_income": 75000,
        "country": "FR",
        "objectives": ["reduce_tax", "optimize_wealth"],
        "assets": 500000,
        "age": 35
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'annual_income' not in data:
            return jsonify({
                "error": "Paramètre 'annual_income' requis",
                "status": "error"
            }), 400
        
        profile = {
            "annual_income": float(data['annual_income']),
            "country": data.get('country', 'FR'),
            "objectives": data.get('objectives', ['reduce_tax']),
            "assets": data.get('assets', 0),
            "age": data.get('age', 30)
        }
        
        # Conseils d'optimisation
        advice = francis_particulier.knowledge_base.get_tax_optimization_advice(profile)
        
        return jsonify({
            "status": "success",
            "advice": advice
        })
        
    except ValueError as e:
        return jsonify({
            "error": f"Données invalides: {str(e)}",
            "status": "error"
        }), 400
    except Exception as e:
        return jsonify({
            "error": f"Erreur lors de l'optimisation: {str(e)}",
            "status": "error"
        }), 500

@francis_particulier_bp.route('/api/francis-particulier/countries', methods=['GET'])
def get_supported_countries():
    """Retourne la liste des pays supportés"""
    try:
        countries = francis_particulier.get_supported_countries()
        
        return jsonify({
            "status": "success",
            "countries": countries,
            "count": len(countries)
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Erreur lors de la récupération: {str(e)}",
            "status": "error"
        }), 500

@francis_particulier_bp.route('/api/francis-particulier/stream', methods=['POST'])
def francis_particulier_stream():
    """
    Endpoint de streaming pour réponses en temps réel
    
    Body JSON:
    {
        "query": "Ma question fiscale",
        "user_profile": {...}
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                "error": "Paramètre 'query' requis",
                "status": "error"
            }), 400
        
        query = data['query']
        user_profile = data.get('user_profile', {})
        
        def generate_stream():
            """Générateur pour le streaming"""
            try:
                # Simulation du streaming avec asyncio
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                async def stream_response():
                    async for chunk in francis_particulier.generate_response_stream(query, user_profile):
                        yield f"data: {chunk}\n\n"
                
                for chunk in loop.run_until_complete(stream_response().__anext__()):
                    yield chunk
                    
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        return Response(
            generate_stream(),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            }
        )
        
    except Exception as e:
        return jsonify({
            "error": f"Erreur lors du streaming: {str(e)}",
            "status": "error"
        }), 500

@francis_particulier_bp.route('/api/francis-particulier/health', methods=['GET'])
def health_check():
    """Vérification de l'état du service"""
    try:
        # Vérification de la disponibilité d'Ollama
        ollama_available = francis_particulier.ollama_client.is_available()
        
        # Vérification de la base de connaissance
        kb_countries = len(francis_particulier.knowledge_base.countries_data)
        
        return jsonify({
            "status": "healthy",
            "services": {
                "knowledge_base": "operational",
                "ollama_llm": "available" if ollama_available else "unavailable",
                "countries_supported": kb_countries
            },
            "capabilities": {
                "tax_calculation": True,
                "country_comparison": True,
                "optimization_advice": True,
                "intelligent_analysis": ollama_available,
                "response_enrichment": ollama_available
            }
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

# Route de test simple
@francis_particulier_bp.route('/api/francis-particulier/test', methods=['GET'])
def test_francis():
    """Test simple de Francis Particulier"""
    try:
        test_query = "Combien d'impôt je paie avec 50000€ en France ?"
        response = get_francis_particulier_response(test_query)
        
        return jsonify({
            "status": "success",
            "test_query": test_query,
            "response": response[:200] + "..." if len(response) > 200 else response
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500
