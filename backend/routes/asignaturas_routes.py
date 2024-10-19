# routes/asignaturas_routes.py
from flask import Blueprint
from controllers.asignaturas_controller import obtener_asignaturas

asignaturas_bp = Blueprint('asignaturas_bp', __name__)

@asignaturas_bp.route('/api/obtener_asignaturas', methods=['GET'])
def obtener_asignaturas_route():
    return obtener_asignaturas()
