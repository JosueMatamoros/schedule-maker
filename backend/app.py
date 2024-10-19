# app.py
import logging
from flask import Flask
from flask_cors import CORS
from routes.asignaturas_routes import asignaturas_bp
from routes.profesores_routes import profesores_bp
from routes.aulas_routes import aulas_bp
from routes.prolog_routes import prolog_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configurar el logging
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s %(levelname)s %(message)s',
                        handlers=[
                            logging.FileHandler("app.log"),
                            logging.StreamHandler()
                        ])

    # Registrar los blueprints
    app.register_blueprint(asignaturas_bp)
    app.register_blueprint(profesores_bp)
    app.register_blueprint(aulas_bp)
    app.register_blueprint(prolog_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5001)
