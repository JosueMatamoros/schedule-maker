# controllers/prolog_controller.py
import logging
from swiplserver import PrologMQI, PrologThread, PrologError
from flask import request, jsonify
import queries
from database import connect_db, close_db

def enviar_datos_a_prolog():
    try:
        # Paso 1: Obtener las asignaturas seleccionadas desde el frontend
        seleccionadas = request.json.get('asignaturas_seleccionadas', [])
        logging.info(f"Asignaturas seleccionadas recibidas: {seleccionadas}")

        if not seleccionadas:
            logging.warning("No se han seleccionado asignaturas.")
            return jsonify({"error": "No se han seleccionado asignaturas."}), 400

        # Extraer solo los nombres de las asignaturas
        asignaturas_nombres = [asignatura['nombre'] for asignatura in seleccionadas]
        logging.info(f"Nombres de asignaturas seleccionadas: {asignaturas_nombres}")

        # Paso 2: Obtener los profesores que pueden impartir las asignaturas seleccionadas
        conn = connect_db()
        if conn is None:
            logging.error("No se pudo conectar a la base de datos.")
            return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

        cursor = conn.cursor()
        cursor.execute(queries.get_professors_with_selected_asignaturas_query(), (asignaturas_nombres,))
        profesores = cursor.fetchall()
        logging.info(f"Profesores obtenidos: {profesores}")

        # Paso 3: Obtener las aulas (solo nombre y tipo)
        cursor.execute(queries.get_aulas_query())
        aulas = cursor.fetchall()
        logging.info(f"Aulas obtenidas: {aulas}")

        cursor.close()
        close_db(conn)

        # Paso 4: Conectar con Prolog y enviar los datos
        with PrologMQI() as mqi:
            with mqi.create_thread() as prolog_thread:
                # Cargar el archivo Prolog (por ahora vacío)
                prolog_file = 'consulta_uno.pl'
                logging.info(f"Cargando archivo Prolog: {prolog_file}")
                prolog_thread.query(f"consult('{prolog_file}')")

                # Enviar asignaturas a Prolog
                for asignatura in seleccionadas:
                    nombre = asignatura['nombre'].replace("'", "\\'")
                    tipo_aula = asignatura['tipo_aula'].replace("'", "\\'")
                    prolog_thread.query(f"assertz(asignatura('{nombre}', '{tipo_aula}')).")
                    logging.debug(f"Asignatura enviada a Prolog: {nombre}, {tipo_aula}")

                # Enviar profesores a Prolog
                for profesor in profesores:
                    nombre_profesor = profesor[0].replace("'", "\\'")
                    asignaturas = profesor[1]  # Lista de asignaturas
                    for asignatura in asignaturas:
                        asignatura = asignatura.replace("'", "\\'")
                        prolog_thread.query(f"assertz(puede_impartir('{nombre_profesor}', '{asignatura}')).")
                        logging.debug(f"Profesor enviado a Prolog: {nombre_profesor}, {asignatura}")

                # Enviar aulas a Prolog
                for aula in aulas:
                    nombre_aula = aula[0].replace("'", "\\'")
                    tipo_aula = aula[3].replace("'", "\\'")
                    prolog_thread.query(f"assertz(aula('{nombre_aula}', '{tipo_aula}')).")
                    logging.debug(f"Aula enviada a Prolog: {nombre_aula}, {tipo_aula}")

        logging.info("Datos enviados a Prolog correctamente.")
        return jsonify({"message": "Datos enviados a Prolog correctamente"}), 200

    except PrologError as e:
        logging.error(f"Error en Prolog: {e}")
        return jsonify({"error": "Error en Prolog"}), 500
    except Exception as e:
        logging.error(f"Error general: {e}")
        return jsonify({"error": "Error general"}), 500
