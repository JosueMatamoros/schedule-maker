# routes/profesores_routes.py
from flask import Blueprint
from controllers.profesor_controller import obtener_profesores

profesores_bp = Blueprint('profesores_bp', __name__)

@profesores_bp.route('/api/obtener_profesores', methods=['GET'])
def obtener_profesores_route():
    return obtener_profesores()
