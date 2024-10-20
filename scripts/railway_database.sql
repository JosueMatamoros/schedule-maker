CREATE TABLE profesor (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(50) UNIQUE NOT NULL,
    horarios_disponibles JSONB NOT NULL  -- Almacena los horarios en formato JSONB por día de la semana
);

CREATE TABLE asignatura (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo_aula VARCHAR(50) CHECK (tipo_aula IN ('normal', 'laboratorio')),
    numero_creditos INTEGER NOT NULL CHECK (numero_creditos > 0),
    semestre INTEGER CHECK (semestre >= 1 AND semestre <= 7)  -- Semestres del 1 al 7
);

CREATE TABLE aulas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    numero_aula VARCHAR(50) NOT NULL,
    capacidad INTEGER NOT NULL CHECK (capacidad > 0)
);

ALTER TABLE aulas ADD COLUMN tipo VARCHAR(50) CHECK (tipo IN ('normal', 'laboratorio'));


CREATE TABLE profesor_asignatura (
    id SERIAL PRIMARY KEY,
    profesor_id INT REFERENCES profesor(id) ON DELETE CASCADE,
    asignatura_id INT REFERENCES asignatura(id) ON DELETE CASCADE
);

-- Semestre 1
INSERT INTO asignatura (nombre, numero_creditos, semestre, tipo_aula)
VALUES
('Fundamentos de organización de computadoras', 3, 1, 'normal'),
('Introducción a la programación', 3, 1, 'laboratorio'),
('Taller de programación', 3, 1, 'laboratorio');

-- Semestre 2
INSERT INTO asignatura (nombre, numero_creditos, semestre, tipo_aula)
VALUES
('Estructuras de datos', 4, 2, 'normal'),
('Programación orientada a objetos', 3, 2, 'laboratorio'),
('Arquitectura de computadores', 4, 2, 'laboratorio');

-- Semestre 3
INSERT INTO asignatura (nombre, numero_creditos, semestre, tipo_aula)
VALUES
('Análisis de algoritmos', 4, 3, 'laboratorio'),
('Bases de datos I', 4, 3, 'laboratorio'),
('Requerimientos de software', 4, 3, 'normal');

-- Semestre 4
INSERT INTO asignatura (nombre, numero_creditos, semestre, tipo_aula)
VALUES
('Bases de datos II', 3, 4, 'laboratorio'),
('Lenguajes de programación', 4, 4, 'laboratorio'),
('Diseño de software', 4, 4, 'normal');

-- Semestre 5
INSERT INTO asignatura (nombre, numero_creditos, semestre, tipo_aula)
VALUES
('Administración de proyectos', 4, 5, 'normal'),
('Compiladores e intérpretes', 4, 5, 'laboratorio'),
('Aseguramiento de la calidad del software', 3, 5, 'laboratorio');

-- Semestre 6
INSERT INTO asignatura (nombre, numero_creditos, semestre, tipo_aula)
VALUES
('Electiva I', 3, 6, 'normal'),
('Investigación de operaciones', 4, 6, 'normal'),
('Principios de sistemas operativos', 4, 6, 'laboratorio'),
('Computación y sociedad', 2, 6, 'normal'),
('Seguridad del software', 3, 6, 'laboratorio');

-- Semestre 7
INSERT INTO asignatura (nombre, numero_creditos, semestre, tipo_aula)
VALUES
('Electiva II', 3, 7, 'normal'),
('Inteligencia artificial', 4, 7, 'laboratorio'),
('Redes', 4, 7, 'laboratorio'),
('Proyecto de ingeniería de software', 3, 7, 'laboratorio');

-- Laboratorios
INSERT INTO aulas (nombre, numero_aula, capacidad, tipo)
VALUES
('Laboratorio 1', '01-LAB', 30, 'laboratorio'),
('Laboratorio 2', '02-LAB', 30, 'laboratorio'),
('Laboratorio 3', '03-LAB', 35, 'laboratorio'),
('Laboratorio 4', '04-LAB', 35, 'laboratorio');


-- Miniauditorio
INSERT INTO aulas (nombre, numero_aula, capacidad, tipo)
VALUES
('Miniauditorio', '01-AUC', 50, 'laboratorio');

-- Aulas Normales
INSERT INTO aulas (nombre, numero_aula, capacidad, tipo)
VALUES
('Aula Normal 1', '01-A', 40, 'normal'),
('Aula Normal 2', '02-A', 40, 'normal'),
('Aula Normal 3', '03-A', 45, 'normal');

-- Leo Viquez
INSERT INTO profesor (nombre, cedula, horarios_disponibles)
VALUES ('Leo Viquez', '2-0834-0874', '{
    "Lunes": {"inicio": "07:00", "fin": "16:00"},
    "Martes": {"inicio": "07:00", "fin": "16:00"},
    "Miercoles": {"inicio": "07:00", "fin": "16:00"},
    "Jueves": {"inicio": "07:00", "fin": "16:00"},
    "Viernes": {"inicio": "07:00", "fin": "16:00"}
}');

-- Abel
INSERT INTO profesor (nombre, cedula, horarios_disponibles)
VALUES ('Abel', '2-1234-5678', '{
    "Lunes": {"inicio": "08:00", "fin": "14:00"},
    "Martes": {"inicio": "07:00", "fin": "16:00"},
    "Miercoles": {"inicio": "07:00", "fin": "16:00"},
    "Jueves": {"inicio": "08:00", "fin": "12:30"}
}');

-- Jorge
INSERT INTO profesor (nombre, cedula, horarios_disponibles)
VALUES ('Jorge', '3-2345-6789', '{
    "Lunes": {"inicio": "07:00", "fin": "16:00"},
    "Martes": {"inicio": "07:00", "fin": "16:00"},
    "Miercoles": {"inicio": "07:00", "fin": "16:00"}
}');

-- Lorena
INSERT INTO profesor (nombre, cedula, horarios_disponibles)
VALUES ('Lorena', '4-3456-7890', '{
    "Lunes": {"inicio": "07:00", "fin": "16:00"},
    "Martes": {"inicio": "07:00", "fin": "16:00"}
}');

-- Marvin
INSERT INTO profesor (nombre, cedula, horarios_disponibles)
VALUES ('Marvin', '3-0987-6543', '{
    "Lunes": {"inicio": "08:00", "fin": "14:00"},
    "Martes": {"inicio": "07:00", "fin": "16:00"},
    "Miercoles": {"inicio": "07:00", "fin": "16:00"},
    "Viernes": {"inicio": "07:00", "fin": "12:00"}
}');

-- Jonathan Solis
INSERT INTO profesor (nombre, cedula, horarios_disponibles)
VALUES ('Jonathan Solis', '4-8765-4321', '{
    "Lunes": {"inicio": "07:00", "fin": "16:00"},
    "Martes": {"inicio": "07:00", "fin": "16:00"},
    "Jueves": {"inicio": "07:00", "fin": "16:00"}
}');

-- Rocio
INSERT INTO profesor (nombre, cedula, horarios_disponibles)
VALUES ('Rocio', '5-5678-9012', '{
    "Martes": {"inicio": "07:00", "fin": "16:00"},
    "Jueves": {"inicio": "07:00", "fin": "16:00"}
}');

-- Oscar Viquez
INSERT INTO profesor (nombre, cedula, horarios_disponibles)
VALUES ('Oscar Viquez', '2-2345-6789', '{
    "Lunes": {"inicio": "07:00", "fin": "16:00"},
    "Miercoles": {"inicio": "07:00", "fin": "16:00"},
    "Viernes": {"inicio": "07:00", "fin": "16:00"}
}');

-- McClovin
INSERT INTO profesor (nombre, cedula, horarios_disponibles)
VALUES ('McClovin', '3-1234-5678', '{
    "Lunes": {"inicio": "07:00", "fin": "16:00"},
    "Miercoles": {"inicio": "07:00", "fin": "16:00"},
    "Viernes": {"inicio": "07:00", "fin": "16:00"}
}');

-- Gaudi
INSERT INTO profesor (nombre, cedula, horarios_disponibles)
VALUES ('Gaudi', '4-0987-6543', '{
    "Lunes": {"inicio": "07:00", "fin": "16:00"},
    "Jueves": {"inicio": "07:00", "fin": "16:00"}
}');


-- Profesor - Asignatura
-- Leo Viquez
INSERT INTO profesor_asignatura (profesor_id, asignatura_id)
VALUES
((SELECT id FROM profesor WHERE nombre = 'Leo Viquez'), (SELECT id FROM asignatura WHERE nombre = 'Introducción a la programación')),
((SELECT id FROM profesor WHERE nombre = 'Leo Viquez'), (SELECT id FROM asignatura WHERE nombre = 'Taller de programación')),
((SELECT id FROM profesor WHERE nombre = 'Leo Viquez'), (SELECT id FROM asignatura WHERE nombre = 'Programación orientada a objetos')),
((SELECT id FROM profesor WHERE nombre = 'Leo Viquez'), (SELECT id FROM asignatura WHERE nombre = 'Bases de datos I')),
((SELECT id FROM profesor WHERE nombre = 'Leo Viquez'), (SELECT id FROM asignatura WHERE nombre = 'Bases de datos II'));

-- Abel
INSERT INTO profesor_asignatura (profesor_id, asignatura_id)
VALUES
((SELECT id FROM profesor WHERE nombre = 'Abel'), (SELECT id FROM asignatura WHERE nombre = 'Introducción a la programación')),
((SELECT id FROM profesor WHERE nombre = 'Abel'), (SELECT id FROM asignatura WHERE nombre = 'Taller de programación')),
((SELECT id FROM profesor WHERE nombre = 'Abel'), (SELECT id FROM asignatura WHERE nombre = 'Investigación de operaciones')),
((SELECT id FROM profesor WHERE nombre = 'Abel'), (SELECT id FROM asignatura WHERE nombre = 'Inteligencia artificial')),
((SELECT id FROM profesor WHERE nombre = 'Abel'), (SELECT id FROM asignatura WHERE nombre = 'Proyecto de ingeniería de software'));

-- Jorge
INSERT INTO profesor_asignatura (profesor_id, asignatura_id)
VALUES
((SELECT id FROM profesor WHERE nombre = 'Jorge'), (SELECT id FROM asignatura WHERE nombre = 'Arquitectura de computadores')),
((SELECT id FROM profesor WHERE nombre = 'Jorge'), (SELECT id FROM asignatura WHERE nombre = 'Bases de datos I')),
((SELECT id FROM profesor WHERE nombre = 'Jorge'), (SELECT id FROM asignatura WHERE nombre = 'Aseguramiento de la calidad del software')),
((SELECT id FROM profesor WHERE nombre = 'Jorge'), (SELECT id FROM asignatura WHERE nombre = 'Principios de sistemas operativos'));

-- Lorena
INSERT INTO profesor_asignatura (profesor_id, asignatura_id)
VALUES
((SELECT id FROM profesor WHERE nombre = 'Lorena'), (SELECT id FROM asignatura WHERE nombre = 'Estructuras de datos')),
((SELECT id FROM profesor WHERE nombre = 'Lorena'), (SELECT id FROM asignatura WHERE nombre = 'Análisis de algoritmos'));

-- Marvin
INSERT INTO profesor_asignatura (profesor_id, asignatura_id)
VALUES
((SELECT id FROM profesor WHERE nombre = 'Marvin'), (SELECT id FROM asignatura WHERE nombre = 'Requerimientos de software')),
((SELECT id FROM profesor WHERE nombre = 'Marvin'), (SELECT id FROM asignatura WHERE nombre = 'Diseño de software')),
((SELECT id FROM profesor WHERE nombre = 'Marvin'), (SELECT id FROM asignatura WHERE nombre = 'Aseguramiento de la calidad del software')),
((SELECT id FROM profesor WHERE nombre = 'Marvin'), (SELECT id FROM asignatura WHERE nombre = 'Seguridad del software'));

-- Jonathan Solis
INSERT INTO profesor_asignatura (profesor_id, asignatura_id)
VALUES
((SELECT id FROM profesor WHERE nombre = 'Jonathan Solis'), (SELECT id FROM asignatura WHERE nombre = 'Fundamentos de organización de computadoras')),
((SELECT id FROM profesor WHERE nombre = 'Jonathan Solis'), (SELECT id FROM asignatura WHERE nombre = 'Programación orientada a objetos')),
((SELECT id FROM profesor WHERE nombre = 'Jonathan Solis'), (SELECT id FROM asignatura WHERE nombre = 'Redes'));

-- Rocio
INSERT INTO profesor_asignatura (profesor_id, asignatura_id)
VALUES
((SELECT id FROM profesor WHERE nombre = 'Rocio'), (SELECT id FROM asignatura WHERE nombre = 'Fundamentos de organización de computadoras')),
((SELECT id FROM profesor WHERE nombre = 'Rocio'), (SELECT id FROM asignatura WHERE nombre = 'Electiva I')),
((SELECT id FROM profesor WHERE nombre = 'Rocio'), (SELECT id FROM asignatura WHERE nombre = 'Electiva II'));


-- Oscar Viquez
INSERT INTO profesor_asignatura (profesor_id, asignatura_id)
VALUES
((SELECT id FROM profesor WHERE nombre = 'Oscar Viquez'), (SELECT id FROM asignatura WHERE nombre = 'Lenguajes de programación')),
((SELECT id FROM profesor WHERE nombre = 'Oscar Viquez'), (SELECT id FROM asignatura WHERE nombre = 'Compiladores e intérpretes'));

-- McClovin
INSERT INTO profesor_asignatura (profesor_id, asignatura_id)
VALUES
((SELECT id FROM profesor WHERE nombre = 'McClovin'), (SELECT id FROM asignatura WHERE nombre = 'Bases de datos I')),
((SELECT id FROM profesor WHERE nombre = 'McClovin'), (SELECT id FROM asignatura WHERE nombre = 'Bases de datos II')),
((SELECT id FROM profesor WHERE nombre = 'McClovin'), (SELECT id FROM asignatura WHERE nombre = 'Computación y sociedad'));

-- Gaudi
INSERT INTO profesor_asignatura (profesor_id, asignatura_id)
VALUES
((SELECT id FROM profesor WHERE nombre = 'Gaudi'), (SELECT id FROM asignatura WHERE nombre = 'Administración de proyectos'));


