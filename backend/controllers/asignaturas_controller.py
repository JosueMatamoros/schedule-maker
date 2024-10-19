# controllers/asignaturas_controller.py
from flask import jsonify
from database import connect_db, close_db
import queries
import logging

def obtener_asignaturas():
    conn = connect_db()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(queries.get_subjects_query())
        rows = cursor.fetchall()
        asignaturas = [{"nombre": row[0], "semestre": row[1], "tipo_aula": row[2]} for row in rows]
        cursor.close()
        return jsonify(asignaturas), 200
    except Exception as e:
        logging.error(f"Error ejecutando la consulta: {e}")
        return jsonify({"error": "Error ejecutando la consulta"}), 500
    finally:
        close_db(conn)
