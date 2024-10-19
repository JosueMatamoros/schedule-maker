% consulta_uno.pl

:- dynamic asignatura/2.
:- dynamic puede_impartir/2.
:- dynamic aula/2.

% Días de la semana
dia('Lunes').
dia('Martes').
dia('Miércoles').
dia('Jueves').
dia('Viernes').

% Horas disponibles (start times)
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

% Reglas básicas
inicio :-
    generar_3_horarios(3).

% Generar N horarios distintos
generar_3_horarios(0).
generar_3_horarios(N) :-
    N > 0,
    generar_horario(Horario),
    format('--- Horario ~w ---~n', [N]),
    imprimir_horario(Horario),
    nl,
    N1 is N - 1,
    generar_3_horarios(N1).

% Generar un solo horario
generar_horario(Horario) :-
    findall(asignatura(Nombre, Tipo_aula), asignatura(Nombre, Tipo_aula), Asignaturas),
    random_permutation(Asignaturas, AsignaturasRandom),
    generar_horario_aux(AsignaturasRandom, [], Horario).

% Auxiliar para generar el horario
generar_horario_aux([], Horario, Horario).
generar_horario_aux([asignatura(Nombre, Tipo_aula) | Rest], HorarioAcc, HorarioFinal) :-
    % Obtener todos los profesores que pueden impartir la asignatura
    findall(Profesor, puede_impartir(Profesor, Nombre), Profesores),
    Profesores \= [],
    % Seleccionar un profesor aleatoriamente
    random_member(ProfesorSeleccionado, Profesores),
    % Obtener todas las aulas del tipo requerido
    findall(Nombre_aula, aula(Nombre_aula, Tipo_aula), Aulas),
    Aulas \= [],
    % Seleccionar un aula aleatoriamente
    random_member(AulaSeleccionada, Aulas),
    % Determinar el número de bloques (1 o 2)
    random_between(1, 2, Bloques),
    ( Bloques =:= 1 ->
        Duracion = 4,
        % Asignar un bloque
        asignar_bloque(Duracion, Dia, HoraInicio, HoraFin, HorarioAcc),
        HorarioNuevaAsignacion = [horario(Nombre, ProfesorSeleccionado, AulaSeleccionada, Dia, HoraInicio, HoraFin) | HorarioAcc]
    ;
        Bloques = 2,
        Duracion1 = 2,
        Duracion2 = 2,
        % Asignar el primer bloque
        asignar_bloque(Duracion1, Dia1, HoraInicio1, HoraFin1, HorarioAcc),
        % Asignar el segundo bloque en un día diferente
        asignar_bloque(Duracion2, Dia2, HoraInicio2, HoraFin2, [horario(Nombre, ProfesorSeleccionado, AulaSeleccionada, Dia1, HoraInicio1, HoraFin1) | HorarioAcc]),
        HorarioNuevaAsignacion = [
            horario(Nombre, ProfesorSeleccionado, AulaSeleccionada, Dia1, HoraInicio1, HoraFin1),
            horario(Nombre, ProfesorSeleccionado, AulaSeleccionada, Dia2, HoraInicio2, HoraFin2)
        | HorarioAcc
        ]
    ),
    generar_horario_aux(Rest, HorarioNuevaAsignacion, HorarioFinal).

% Asignar un bloque de lecciones
asignar_bloque(Duracion, Dia, HoraInicio, HoraFin, HorarioAcc) :-
    % Seleccionar un día aleatoriamente que no tenga conflicto para este bloque
    findall(D, dia(D), Dias),
    random_member(Dia, Dias),
    % Seleccionar una hora de inicio aleatoriamente
    findall(H, hora(H), Horas),
    random_member(HoraInicio, Horas),
    % Calcular la hora de fin basada en la duración
    calcular_hora_fin(HoraInicio, Duracion, HoraFin),
    % Asegurarse de que no hay conflictos en el horario
    \+ hay_conflicto(Dia, HoraInicio, HoraFin, HorarioAcc).

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
hora_a_minutos('07:00', 420).
hora_a_minutos('07:55', 475).
hora_a_minutos('08:50', 530).
hora_a_minutos('09:45', 585).
hora_a_minutos('10:40', 640).
hora_a_minutos('11:35', 695).
hora_a_minutos('12:30', 750).
hora_a_minutos('13:25', 805).
hora_a_minutos('14:20', 860).
hora_a_minutos('15:15', 915).
hora_a_minutos('16:10', 970).

% Convertir minutos a hora en formato 'HH:MM'
minutos_a_hora(Min, HoraFin) :-
    Hora is Min // 60,
    Minutos is Min mod 60,
    format(atom(HoraFin), '~`0t~d~2|:~`0t~d~2|', [Hora, Minutos]).

% Verificar si hay conflicto en el horario
hay_conflicto(Dia, HoraInicio, HoraFin, HorarioAcc) :-
    member(horario(_, _, _, Dia, HInicio, HFin), HorarioAcc),
    hora_a_minutos(HInicio, MinInicioExistente),
    hora_a_minutos(HFin, MinFinExistente),
    hora_a_minutos(HoraInicio, MinInicioNuevo),
    hora_a_minutos(HoraFin, MinFinNuevo),
    % Verificar si los intervalos se solapan
    (MinInicioNuevo < MinFinExistente,
     MinFinNuevo > MinInicioExistente).

% Imprimir el horario
imprimir_horario([]).
imprimir_horario([horario(Nombre, Profesor, Aula, Dia, Inicio, Fin) | Rest]) :-
    format('~w - Profesor: ~w - Aula: ~w - Día: ~w - ~w a ~w~n', [Nombre, Profesor, Aula, Dia, Inicio, Fin]),
    imprimir_horario(Rest).
