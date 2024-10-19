import logging
from swiplserver import PrologMQI, PrologError
from flask import request, jsonify
import queries
from database import connect_db, close_db
import json

def enviar_datos_a_prolog():
    try:
        # Configurar logging para mostrar mensajes DEBUG
        logging.basicConfig(level=logging.DEBUG)

        # Paso 1: Obtener las asignaturas seleccionadas y el parámetro 'consulta' desde el frontend
        data = request.json
        seleccionadas = data.get('asignaturas_seleccionadas', [])
        consulta = data.get('consulta', '1')  # Por defecto, '1' si no se especifica
        logging.info(f"Consulta solicitada: {consulta}")
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

        if consulta == '1':
            # Consulta 1: Utilizar el query existente
            cursor.execute(queries.get_professors_with_selected_asignaturas_query(), (asignaturas_nombres,))
            profesores = cursor.fetchall()
            logging.info(f"Profesores obtenidos: {profesores}")
        elif consulta == '2':
            # Consulta 2: Obtener profesores con horarios disponibles
            cursor.execute(queries.get_professors_with_schedules_query(), (asignaturas_nombres,))
            profesores = cursor.fetchall()
            logging.info(f"Profesores obtenidos con horarios: {profesores}")
        else:
            logging.error("Consulta no reconocida.")
            return jsonify({"error": "Consulta no reconocida."}), 400

        # Paso 3: Obtener las aulas (solo nombre y tipo)
        cursor.execute(queries.get_aulas_query())
        aulas = cursor.fetchall()
        logging.info(f"Aulas obtenidas: {aulas}")

        cursor.close()
        close_db(conn)

        # Paso 4: Conectar con Prolog y enviar los datos
        with PrologMQI() as mqi:
            with mqi.create_thread() as prolog_thread:
                # Cargar el archivo Prolog correspondiente según la consulta
                if consulta == '1':
                    prolog_file = 'consulta_uno.pl'
                elif consulta == '2':
                    prolog_file = 'consulta_dos.pl'
                else:
                    logging.error("Consulta no reconocida al cargar el archivo Prolog.")
                    return jsonify({"error": "Consulta no reconocida."}), 400

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

                    # Si es consulta 2, procesar y enviar horarios del profesor
                    if consulta == '2':
                        horarios_json = profesor[2]  # Campo horarios_disponibles
                        if horarios_json:
                            if isinstance(horarios_json, str):
                                horarios_dict = json.loads(horarios_json)
                            elif isinstance(horarios_json, dict):
                                horarios_dict = horarios_json
                            else:
                                horarios_dict = {}
                            logging.debug(f"horarios_dict para el profesor {nombre_profesor}: {horarios_dict}")
                            for dia, horario in horarios_dict.items():
                                inicio = horario['inicio']
                                fin = horario['fin']
                                dia = dia.capitalize()  # Asegurarse de que el día esté capitalizado
                                prolog_thread.query(f"assertz(horario_profesor('{nombre_profesor}', '{dia}', '{inicio}', '{fin}')).")
                                logging.debug(f"Horario disponible enviado a Prolog: {nombre_profesor}, {dia}, {inicio}-{fin}")

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
                    return jsonify({"horarios": []}), 200  # Devolver lista vacía de horarios

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
                        elif isinstance(horario, dict) and 'functor' in horario:
                            # Caso en que solo hay una asignación en el horario
                            args = horario['args']
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
                    return jsonify({"horarios": []}), 200  # Devolver lista vacía de horarios

    except PrologError as e:
        logging.error(f"Error en Prolog: {e}")
        return jsonify({"error": "Error en Prolog"}), 500
    except Exception as e:
        logging.error(f"Error general: {e}")
        return jsonify({"error": f"Error general: {str(e)}"}), 500
