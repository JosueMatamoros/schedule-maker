% consulta_dos.pl

:- dynamic asignatura/2.
:- dynamic puede_impartir/2.
:- dynamic aula/2.
:- dynamic horario_profesor/4.

% Días de la semana
dia('Lunes').
dia('Martes').
dia('Miércoles').
dia('Jueves').
dia('Viernes').

% Horas disponibles (horas de inicio)
hora('07:00').
hora('07:55').
hora('08:50').
hora('09:45').
hora('10:40').
hora('11:35').
hora('12:30').
hora('13:25').
hora('14:20').
hora('15:15').
hora('16:10').

% Predicado principal
inicio(Horarios) :-
    generar_horarios(3, HorariosGenerados),
    (HorariosGenerados \= [] ->
        Horarios = HorariosGenerados
    ;
        Horarios = []
    ).

% Generar hasta N horarios distintos
generar_horarios(N, Horarios) :-
    generar_horarios(N, [], Horarios).

generar_horarios(0, HorariosAcc, Horarios) :-
    reverse(HorariosAcc, Horarios).
generar_horarios(N, HorariosAcc, HorariosFinal) :-
    N > 0,
    MaxIntentos = 10, % Puedes ajustar este valor si es necesario
    generar_horario_con_intentos(Horario, MaxIntentos),
    (Horario \= [] ->
        N1 is N - 1,
        generar_horarios(N1, [Horario | HorariosAcc], HorariosFinal)
    ;
        % Si no se pudo generar un horario, disminuir N y continuar
        N1 is N - 1,
        generar_horarios(N1, HorariosAcc, HorariosFinal)
    ).

% Intentar generar un horario con un número máximo de intentos
generar_horario_con_intentos(Horario, MaxIntentos) :-
    MaxIntentos > 0,
    (generar_horario(Horario) ->
        true
    ;
        NIntentos is MaxIntentos - 1,
        generar_horario_con_intentos(Horario, NIntentos)
    ).
generar_horario_con_intentos([], 0). % Si no se pudo generar, devolver lista vacía

% Generar un solo horario
generar_horario(HorarioFinal) :-
    findall(asignatura(Nombre, Tipo_aula), asignatura(Nombre, Tipo_aula), Asignaturas),
    generar_horario_aux(Asignaturas, [], Horario),
    % Si se asignó al menos una materia, considerar el horario válido
    (Horario \= [] ->
        HorarioFinal = Horario
    ;
        fail % Si no se pudo asignar ninguna materia, el horario no es válido
    ).

% Auxiliar para generar el horario
generar_horario_aux([], Horario, Horario).
generar_horario_aux([asignatura(Nombre, Tipo_aula) | Rest], HorarioAcc, HorarioFinal) :-
    (   % Intentar asignar la materia
        asignar_materia(Nombre, Tipo_aula, HorarioAcc, HorarioNuevaAsignacion)
    ->  HorarioAcc1 = HorarioNuevaAsignacion
    ;   % Si falla, continuar sin asignar esta materia
        HorarioAcc1 = HorarioAcc
    ),
    generar_horario_aux(Rest, HorarioAcc1, HorarioFinal).

% Intentar asignar una materia
asignar_materia(Nombre, Tipo_aula, HorarioAcc, HorarioNuevaAsignacion) :-
    % Obtener todos los profesores que pueden impartir la asignatura
    findall(Profesor, puede_impartir(Profesor, Nombre), Profesores),
    Profesores \= [],
    % Seleccionar un profesor aleatoriamente
    random_member(ProfesorSeleccionado, Profesores),
    % Obtener horarios disponibles del profesor
    findall(horario_profesor(ProfesorSeleccionado, DiaDisponible, InicioDisponible, FinDisponible),
            horario_profesor(ProfesorSeleccionado, DiaDisponible, InicioDisponible, FinDisponible),
            HorariosDisponibles),
    HorariosDisponibles \= [],
    % Obtener aulas disponibles del tipo requerido
    findall(Nombre_aula, aula(Nombre_aula, Tipo_aula), Aulas),
    Aulas \= [],
    % Determinar la duración
    random_between(1, 2, Bloques),
    ( Bloques =:= 1 ->
        Duracion = 4,
        % Asignar un bloque
        asignar_bloque(Duracion, Tipo_aula, Dia, HoraInicio, HoraFin, HorarioAcc, HorariosDisponibles, ProfesorSeleccionado, AulaSeleccionada),
        Asignacion = [horario(Nombre, ProfesorSeleccionado, AulaSeleccionada, Dia, HoraInicio, HoraFin)],
        append(Asignacion, HorarioAcc, HorarioNuevaAsignacion)
    ;
        Bloques = 2,
        Duracion1 = 2,
        Duracion2 = 2,
        % Asignar el primer bloque
        asignar_bloque(Duracion1, Tipo_aula, Dia1, HoraInicio1, HoraFin1, HorarioAcc, HorariosDisponibles, ProfesorSeleccionado, AulaSeleccionada1),
        % Actualizar HorariosDisponibles y HorarioAcc para el segundo bloque
        Asignacion1 = horario(Nombre, ProfesorSeleccionado, AulaSeleccionada1, Dia1, HoraInicio1, HoraFin1),
        HorarioAcc1 = [Asignacion1 | HorarioAcc],
        actualizar_horarios_disponibles(ProfesorSeleccionado, Dia1, HoraInicio1, HoraFin1, HorariosDisponibles, HorariosDisponibles1),
        % Asignar el segundo bloque
        asignar_bloque(Duracion2, Tipo_aula, Dia2, HoraInicio2, HoraFin2, HorarioAcc1, HorariosDisponibles1, ProfesorSeleccionado, AulaSeleccionada2),
        Asignacion2 = horario(Nombre, ProfesorSeleccionado, AulaSeleccionada2, Dia2, HoraInicio2, HoraFin2),
        Asignacion = [Asignacion1, Asignacion2],
        % Combinar las asignaciones en el horario
        append(Asignacion, HorarioAcc, HorarioNuevaAsignacion)
    ).

% Asignar un bloque de lecciones
asignar_bloque(Duracion, Tipo_aula, Dia, HoraInicio, HoraFin, HorarioAcc, HorariosDisponibles, Profesor, AulaSeleccionada) :-
    asignar_bloque(Duracion, Tipo_aula, Dia, HoraInicio, HoraFin, HorarioAcc, HorariosDisponibles, Profesor, AulaSeleccionada, 0).

asignar_bloque(_, _, _, _, _, _, _, _, _, Intentos) :-
    Intentos >= 500, % Aumentado el límite de intentos
    !, fail.

asignar_bloque(Duracion, Tipo_aula, Dia, HoraInicio, HoraFin, HorarioAcc, HorariosDisponibles, Profesor, AulaSeleccionada, Intentos) :-
    % Seleccionar un horario disponible del profesor
    random_member(horario_profesor(Profesor, Dia, InicioDisponible, FinDisponible), HorariosDisponibles),
    % Seleccionar una hora de inicio aleatoriamente dentro del rango disponible
    horas_en_rango(InicioDisponible, FinDisponible, HorasPosibles),
    HorasPosibles \= [],
    random_member(HoraInicio, HorasPosibles),
    % Calcular la hora de fin
    calcular_hora_fin(HoraInicio, Duracion, HoraFin),
    % Verificar que la hora de fin esté dentro del horario disponible
    hora_a_minutos(HoraFin, MinFinNuevo),
    hora_a_minutos(FinDisponible, MinFinDisponible),
    MinFinNuevo =< MinFinDisponible,
    % Obtener aulas disponibles del tipo requerido
    findall(Nombre_aula, aula(Nombre_aula, Tipo_aula), AulasDisponibles),
    AulasDisponibles \= [],
    random_member(AulaSeleccionada, AulasDisponibles),
    % Asegurarse de que no hay conflictos
    (\+ hay_conflicto(Dia, HoraInicio, HoraFin, HorarioAcc, Profesor, AulaSeleccionada) ->
        true
    ;
        Intentos1 is Intentos + 1,
        asignar_bloque(Duracion, Tipo_aula, Dia, HoraInicio, HoraFin, HorarioAcc, HorariosDisponibles, Profesor, AulaSeleccionada, Intentos1)
    ).

asignar_bloque(Duracion, Tipo_aula, Dia, HoraInicio, HoraFin, HorarioAcc, HorariosDisponibles, Profesor, AulaSeleccionada, Intentos) :-
    Intentos1 is Intentos + 1,
    asignar_bloque(Duracion, Tipo_aula, Dia, HoraInicio, HoraFin, HorarioAcc, HorariosDisponibles, Profesor, AulaSeleccionada, Intentos1).

% Actualizar horarios disponibles del profesor después de asignar un bloque
actualizar_horarios_disponibles(Profesor, Dia, HoraInicio, HoraFin, HorariosDisponibles, HorariosActualizados) :-
    exclude(
        ==(horario_profesor(Profesor, Dia, HoraInicio, HoraFin)),
        HorariosDisponibles,
        HorariosActualizados
    ).

% Obtener horas dentro del rango disponible
horas_en_rango(InicioDisponible, FinDisponible, HorasPosibles) :-
    findall(H, hora(H), TodasHoras),
    include(esta_en_rango(InicioDisponible, FinDisponible), TodasHoras, HorasEnRango),
    HorasEnRango \= [],
    HorasPosibles = HorasEnRango.

esta_en_rango(InicioDisponible, FinDisponible, Hora) :-
    hora_a_minutos(Hora, Minutos),
    hora_a_minutos(InicioDisponible, MinInicio),
    hora_a_minutos(FinDisponible, MinFin),
    Minutos >= MinInicio,
    Minutos =< MinFin.

% Verificar si hay conflicto en el horario
hay_conflicto(Dia, HoraInicio, HoraFin, HorarioAcc, Profesor, Aula) :-
    member(horario(_, ProfesorExistente, AulaExistente, Dia, HInicio, HFin), HorarioAcc),
    (
        ProfesorExistente = Profesor ;
        AulaExistente = Aula
    ),
    hora_a_minutos(HInicio, MinInicioExistente),
    hora_a_minutos(HFin, MinFinExistente),
    hora_a_minutos(HoraInicio, MinInicioNuevo),
    hora_a_minutos(HoraFin, MinFinNuevo),
    % Verificar si los intervalos se solapan
    MinInicioNuevo < MinFinExistente,
    MinFinNuevo > MinInicioExistente.

% Calcular hora de fin basado en hora de inicio y duración
calcular_hora_fin(HoraInicio, Duracion, HoraFin) :-
    hora_a_minutos(HoraInicio, MinInicio),
    (Duracion = 4 ->
        MinFin is MinInicio + 215  % 3 horas 35 minutos
    ;
        Duracion = 2,
        MinFin is MinInicio + 105  % 1 hora 45 minutos
    ),
    minutos_a_hora(MinFin, HoraFin).

% Convertir hora en formato 'HH:MM' a minutos
hora_a_minutos(Hora, Minutos) :-
    split_string(Hora, ":", "", [Hs, Ms]),
    number_string(H, Hs),
    number_string(M, Ms),
    Minutos is H * 60 + M.

% Convertir minutos a hora en formato 'HH:MM'
minutos_a_hora(Minutos, HoraFin) :-
    H is Minutos // 60,
    M is Minutos mod 60,
    format(atom(HoraFin), '~`0t~d~2|:~`0t~d~2|', [H, M]).
