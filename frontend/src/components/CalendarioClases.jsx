// src/components/CalendarioClases.jsx
import React, { useState } from 'react';
import { Card, ButtonGroup, Button } from '@material-tailwind/react';
import ClaseDetalle from './ClaseDetalle';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// Generar las horas del día en intervalos de 1 hora desde 7:00 AM hasta 9:00 PM
const horasDia = Array.from({ length: 10 }, (_, i) => i + 7); // 7:00 AM a 9:00 PM

const CalendarioClases = ({ schedules }) => {
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);

  const abrirDetallesClase = (clase) => {
    setClaseSeleccionada(clase);
  };

  const cerrarDetallesClase = () => {
    setClaseSeleccionada(null);
  };


  // Obtener el horario actual
  const horario = schedules[currentScheduleIndex];

  return (
    <div className="container mx-auto p-4 ">
      {/* Botones para cambiar entre los horarios generados */}
      <div className="flex w-full justify-center mb-4 ml-24">
    <ButtonGroup variant="gradient" >
      {schedules.map((_, index) => (
        <Button
          key={index}
          onClick={() => setCurrentScheduleIndex(index)}
          className={`${
            currentScheduleIndex === index ? 'bg-blue-500 text-white' : ''
          }`}
        >
          Horario {index + 1}
        </Button>
      ))}
    </ButtonGroup>
  </div>


  <div className="grid grid-cols-6 gap-2">
  <div className="font-bold"></div>
  {diasSemana.map((dia) => (
    <div key={dia} className="font-bold text-center">
      {dia}
    </div>
  ))}
  {horasDia.map((hora) => (
    <React.Fragment key={hora}>
      <div className="font-semibold text-right pr-2 w-auto">{`${hora}:00`}</div>
      {diasSemana.map((dia) => {
        // Buscar si hay una clase en este día y hora
        const clase = horario.find(
          (clase) =>
            clase.dia === dia &&
            parseInt(clase.inicio.split(':')[0], 10) <= hora &&
            hora < parseInt(clase.fin.split(':')[0], 10)
        );
        return (
          <div key={`${dia}-${hora}`} className="border min-h-[60px] relative">
            {clase && (
              <Card
                className="absolute inset-0 m-1 p-2 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                onClick={() => abrirDetallesClase(clase)}
              >
                <h3 className="font-bold text-xs">{clase.asignatura}</h3>
              </Card>
            )}
          </div>
        );
      })}
    </React.Fragment>
  ))}
</div>


      {/* Detalle de la clase seleccionada */}
      {claseSeleccionada && (
        <ClaseDetalle clase={claseSeleccionada} onClose={cerrarDetallesClase} />
      )}
    </div>
  );
};

export default CalendarioClases;
