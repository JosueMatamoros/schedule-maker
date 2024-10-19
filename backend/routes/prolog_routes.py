# routes/prolog_routes.py
from flask import Blueprint
from controllers.prolog_controller import enviar_datos_a_prolog

prolog_bp = Blueprint('prolog_bp', __name__)

@prolog_bp.route('/api/enviar_datos_prolog', methods=['POST'])
def enviar_datos_prolog_route():
    return enviar_datos_a_prolog()
