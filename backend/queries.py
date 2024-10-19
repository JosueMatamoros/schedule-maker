# queries.py

def get_subjects_query():
    """
    Retorna la consulta para obtener todas las asignaturas sin filtrar.
    """
    return """
    SELECT nombre, semestre, tipo_aula
    FROM asignatura
    """

def get_professors_query():
    """
    Retorna la consulta para obtener todos los profesores sin filtrar.
    """
    return """
    SELECT DISTINCT nombre, cedula, horarios_disponibles
    FROM profesor
    """

def get_aulas_query():
    """
    Retorna la consulta para obtener todas las aulas.
    """
    return """
    SELECT nombre, numero_aula, capacidad, tipo
    FROM aulas
    """

def get_professors_with_selected_asignaturas_query():
    """
    Retorna la consulta para obtener profesores junto con las asignaturas que pueden impartir,
    filtrando solo por las asignaturas seleccionadas.
    """
    return """
    SELECT 
        p.nombre,
        array_agg(a.nombre) AS asignaturas
    FROM 
        profesor p
    JOIN 
        profesor_asignatura pa ON p.id = pa.profesor_id
    JOIN 
        asignatura a ON pa.asignatura_id = a.id
    WHERE 
        a.nombre = ANY(%s)
    GROUP BY 
        p.id;
    """

def get_professors_with_schedules_query():
    """
    Retorna la consulta para obtener profesores junto con las asignaturas que pueden impartir y sus horarios disponibles,
    filtrando solo por las asignaturas seleccionadas.
    """
    return """
    SELECT 
        p.nombre,
        array_agg(a.nombre) AS asignaturas,
        p.horarios_disponibles
    FROM 
        profesor p
    JOIN 
        profesor_asignatura pa ON p.id = pa.profesor_id
    JOIN 
        asignatura a ON pa.asignatura_id = a.id
    WHERE 
        a.nombre = ANY(%s)
    GROUP BY 
        p.id, p.nombre, p.horarios_disponibles;
    """
