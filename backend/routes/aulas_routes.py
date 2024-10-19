# routes/aulas_routes.py
from flask import Blueprint
from controllers.aulas_controller import obtener_aulas

aulas_bp = Blueprint('aulas_bp', __name__)

@aulas_bp.route('/api/obtener_aulas', methods=['GET'])
def obtener_aulas_route():
    return obtener_aulas()
