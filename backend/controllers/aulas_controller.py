from flask import jsonify
from database import connect_db, close_db
import queries
import logging

def obtener_aulas():
    conn = connect_db()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(queries.get_aulas_query())
        rows = cursor.fetchall()
        aulas = [{"nombre": row[0], "numero_aula": row[1], "capacidad": row[2], "tipo": row[3]} for row in rows]
        cursor.close()
        return jsonify(aulas), 200
    except Exception as e:
        logging.error(f"Error ejecutando la consulta de aulas: {e}")
        return jsonify({"error": "Error ejecutando la consulta"}), 500
    finally:
        close_db(conn)


def obtener_aula_por_nombre(nombre):
    conn = connect_db()
    if conn is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute(queries.get_aula_by_name_query(), (nombre,))
        row = cursor.fetchone()
        if row:
            aula = {
                "id": row[0],
                "nombre": row[1],
                "numero_aula": row[2],
                "capacidad": row[3],
                "tipo": row[4]
            }
            cursor.close()
            return jsonify(aula), 200
        else:
            cursor.close()
            return jsonify({"error": "Aula no encontrada"}), 404
    except Exception as e:
        logging.error(f"Error ejecutando la consulta: {e}")
        return jsonify({"error": "Error ejecutando la consulta"}), 500
    finally:
        close_db(conn)