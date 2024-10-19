import logging
from swiplserver import PrologMQI, PrologError
from flask import request, jsonify
import queries
from database import connect_db, close_db

def enviar_datos_a_prolog():
    try:
        # Configurar logging para mostrar mensajes DEBUG
        logging.basicConfig(level=logging.DEBUG)

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
                # Cargar el archivo Prolog
                prolog_file = 'consulta_uno.pl'
                logging.info(f"Cargando archivo Prolog: {prolog_file}")
                prolog_thread.query(f"consult('{prolog_file}').")

                # Enviar asignaturas a Prolog
                for asignatura in seleccionadas:
                    nombre = asignatura['nombre'].replace("'", "\\'")
                    tipo_aula = asignatura['tipo_aula'].replace("'", "\\'")
                    prolog_thread.query(f"assertz(asignatura('{nombre}', '{tipo_aula}')).")
                    logging.debug(f"Asignatura enviada a Prolog: {nombre}, {tipo_aula}")

                # Enviar profesores a Prolog
                for profesor in profesores:
                    nombre_profesor = profesor[0].replace("'", "\\'")
                    asignaturas_profesor = profesor[1]  # Lista de asignaturas
                    for asignatura in asignaturas_profesor:
                        asignatura = asignatura.replace("'", "\\'")
                        prolog_thread.query(f"assertz(puede_impartir('{nombre_profesor}', '{asignatura}')).")
                        logging.debug(f"Profesor enviado a Prolog: {nombre_profesor}, {asignatura}")

                # Enviar aulas a Prolog
                for aula in aulas:
                    nombre_aula = aula[0].replace("'", "\\'")
                    tipo_aula = aula[3].replace("'", "\\'")  # Asegúrate de que el índice es correcto
                    prolog_thread.query(f"assertz(aula('{nombre_aula}', '{tipo_aula}')).")
                    logging.debug(f"Aula enviada a Prolog: {nombre_aula}, {tipo_aula}")

                # Ejecutar el predicado 'inicio' para generar y obtener los horarios
                logging.info("Ejecutando 'inicio' en Prolog para generar y obtener los horarios.")
                result = prolog_thread.query("inicio(Horarios).")
                logging.debug(f"Resultado de la consulta a Prolog: {result}")

                # Verificar si 'result' está vacío
                if not result:
                    logging.warning("El resultado de Prolog está vacío.")
                    return jsonify({"error": "No se generaron horarios. El resultado de Prolog está vacío."}), 500

                # Procesar los horarios obtenidos
                if 'Horarios' in result[0]:
                    horarios = result[0]['Horarios']
                    logging.debug(f"Horarios sin procesar: {horarios}")
                    formatted_horarios = []
                    for horario in horarios:
                        horario_formateado = []
                        if isinstance(horario, list):
                            for asignacion in horario:
                                if isinstance(asignacion, dict) and 'functor' in asignacion:
                                    args = asignacion['args']
                                    horario_formateado.append({
                                        'asignatura': args[0],
                                        'profesor': args[1],
                                        'aula': args[2],
                                        'dia': args[3],
                                        'inicio': args[4],
                                        'fin': args[5]
                                    })
                        formatted_horarios.append(horario_formateado)
                    logging.debug(f"Horarios formateados: {formatted_horarios}")
                    logging.info("Horarios generados correctamente.")
                    return jsonify({"horarios": formatted_horarios}), 200
                else:
                    logging.warning("No se generaron horarios. 'Horarios' no está en el resultado.")
                    return jsonify({"error": "No se generaron horarios. 'Horarios' no está en el resultado."}), 500

    except PrologError as e:
        logging.error(f"Error en Prolog: {e}")
        return jsonify({"error": "Error en Prolog"}), 500
    except Exception as e:
        logging.error(f"Error general: {e}")
        return jsonify({"error": f"Error general: {str(e)}"}), 500
