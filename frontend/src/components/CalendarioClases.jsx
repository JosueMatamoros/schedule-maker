import React, { useState } from 'react';
import { Card } from '@material-tailwind/react';
import ClaseDetalle from './ClaseDetalle'; // El componente para mostrar la información detallada

// Datos de ejemplo (modifica estos datos para que coincidan con tu respuesta real)
const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const horasDia = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 AM a 7:00 PM

const CalendarioClases = ({ schedules }) => {
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);

  const abrirDetallesClase = (clase) => {
    setClaseSeleccionada(clase);
  };

  const cerrarDetallesClase = () => {
    setClaseSeleccionada(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Calendario Semanal de Clases</h1>
      <div className="grid grid-cols-6 gap-2">
        <div className="font-bold">Hora</div>
        {diasSemana.map(dia => (
          <div key={dia} className="font-bold text-center">{dia}</div>
        ))}
        {horasDia.map(hora => (
          <React.Fragment key={hora}>
            <div className="font-semibold text-right pr-2">{`${hora}:00`}</div>
            {diasSemana.map((dia, diaIndex) => (
              <div key={`${diaIndex}-${hora}`} className="border min-h-[100px] relative">
                {schedules
                  .filter(clase => clase.dia === dia && parseInt(clase.inicio.split(":")[0]) === hora)
                  .map(clase => (
                    <Card
                      key={`${clase.asignatura}-${clase.profesor}`}
                      className="absolute inset-0 m-1 p-2 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                      onClick={() => abrirDetallesClase(clase)}
                    >
                      <h3 className="font-bold text-sm">{clase.asignatura}</h3>
                      <p className="text-xs">Aula: {clase.aula}</p>
                      <p className="text-xs">Prof: {clase.profesor}</p>
                    </Card>
                  ))}
              </div>
            ))}
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
