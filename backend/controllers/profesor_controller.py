from flask import jsonify
from database import connect_db, close_db
import queries
import logging

def obtener_profesores():
    conn = connect_db()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(queries.get_professors_query())
        rows = cursor.fetchall()
        profesores = [{"nombre": row[0], "cedula": row[1], "horarios_disponibles": row[2]} for row in rows]
        cursor.close()
        return jsonify(profesores), 200
    except Exception as e:
        logging.error(f"Error ejecutando la consulta de profesores: {e}")
        return jsonify({"error": "Error ejecutando la consulta"}), 500
    finally:
        close_db(conn)
        
def obtener_profesor_por_nombre(nombre):
    conn = connect_db()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(queries.get_professor_by_name_query(), (nombre,))
        row = cursor.fetchone()
        if row:
            profesor = {
                "id": row[0],
                "nombre": row[1],
                "cedula": row[2],
                "horarios_disponibles": row[3]
            }
            cursor.close()
            return jsonify(profesor), 200
        else:
            cursor.close()
            return jsonify({"error": "Profesor no encontrado"}), 404
    except Exception as e:
        logging.error(f"Error ejecutando la consulta: {e}")
        return jsonify({"error": "Error ejecutando la consulta"}), 500
    finally:
        close_db(conn)