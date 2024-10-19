// src/components/HorariosConsulta2.jsx
import React, { useState } from 'react';
import ClaseDetalle from './ClaseDetalle';
import { FaChevronLeft, FaChevronRight, FaClock, FaMapMarkerAlt, FaEllipsisV } from 'react-icons/fa';
import { Button } from '@material-tailwind/react';
import { Card, CardBody, CardHeader, Typography } from '@material-tailwind/react';

// Función para agrupar las clases por día y asegurar claves únicas
const horarioSemanal = (horario) => {
  const diasOrdenados = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
  
  // Inicializar el arreglo de días con clases vacías
  const dias = diasOrdenados.map(dia => ({
    diaNombre: dia,
    clases: []
  }));

  // Asignar cada clase al día correspondiente
  horario.forEach((clase, index) => {
    const diaIndex = diasOrdenados.indexOf(clase.dia);
    if (diaIndex !== -1) {
      dias[diaIndex].clases.push({
        id: clase.id || `clase-${clase.asignatura}-${diaIndex}-${index}`, // Generar un ID único si no existe
        nombre: clase.asignatura || 'Asignatura sin nombre',
        profesor: clase.profesor || 'Profesor no especificado', // Usar clase.profesor directamente
        hora: `${clase.inicio || '00:00'} - ${clase.fin || '00:00'}`,
        aula: clase.aula || 'Aula no asignada'
      });
    }
  });

  // Excluir días sin clases
  return dias.filter(dia => dia.clases.length > 0);
};

const HorariosConsulta2 = ({ schedules }) => {
  const [currentPage, setCurrentPage] = useState(0); // Página actual para paginación
  const [claseSeleccionada, setClaseSeleccionada] = useState(null); // Clase seleccionada para detalles

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < schedules.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const abrirDetallesClase = (clase) => {
    setClaseSeleccionada(clase); // Abrir detalles de la clase
  };

  const cerrarDetallesClase = () => {
    setClaseSeleccionada(null); // Cerrar detalles de la clase
  };

  return (
    <div className='mt-12'>
      <Card className="mb-8 w-full max-w-4xl mx-auto">
        <CardHeader className="flex justify-between items-center p-1">
          <Typography variant="h5">Horario {currentPage + 1}</Typography>
          <div className="flex items-center space-x-2">
            <Button
              variant="outlined"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
            >
              <FaChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= schedules.length - 1}
            >
              <FaChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {/* Mostrar solo el horario actual */}
          {horarioSemanal(schedules[currentPage]).map((dia) => (
            <div key={`dia-${dia.diaNombre}`} className="mb-6">
              <Typography variant="h6" className="mb-2">{dia.diaNombre}</Typography>
              {dia.clases.length > 0 ? (
                dia.clases.map((clase, index) => (
                  <Card
                    key={`clase-${clase.id || `${clase.nombre}-${index}`}`} // Asegurar clave única
                    className="mb-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => abrirDetallesClase(clase)}
                  >
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Typography variant="h6" className="text-lg font-semibold">{clase.nombre}</Typography>
                          {/* Mostrar solo el nombre del profesor */}
                          <div className="flex items-center mt-2">
                            <span className="text-sm">{clase.profesor}</span>
                          </div>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <FaClock className="h-5 w-5 mr-2 text-gray-500" />
                            <span>{clase.hora}</span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <FaMapMarkerAlt className="h-5 w-5 mr-2 text-gray-500" />
                            <span>{clase.aula}</span>
                          </div>
                        </div>
                        <Button variant="text" size="sm">
                          <FaEllipsisV className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay clases programadas.</p>
              )}
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Vista de detalles de la clase */}
      {claseSeleccionada && (
        <ClaseDetalle clase={claseSeleccionada} onClose={cerrarDetallesClase} />
      )}
    </div>
  );
};

export default HorariosConsulta2;
