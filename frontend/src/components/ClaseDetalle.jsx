// src/components/ClaseDetalle.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Typography,
  Spinner,
  Collapse,
} from '@material-tailwind/react';
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { RiAccountCircleLine } from 'react-icons/ri';

const ClaseDetalle = ({ clase, onClose }) => {
  // Verificar que 'clase' esté definido
  if (!clase) {
    return null;
  }

  const [profesorData, setProfesorData] = useState(null);
  const [aulaData, setAulaData] = useState(null);
  const [asignaturaData, setAsignaturaData] = useState(null);

  const [profesorOpen, setProfesorOpen] = useState(false);
  const [aulaOpen, setAulaOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determinar el nombre de la asignatura
  const nombreAsignatura = clase.nombre || clase.asignatura || 'Nombre de la Clase';

  // Función para obtener datos del profesor
  const fetchProfesorData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/profesor/${encodeURIComponent(clase.profesor)}`
      );
      if (response.ok) {
        const data = await response.json();
        setProfesorData(data);
      } else {
        console.error('Error al obtener datos del profesor');
      }
    } catch (error) {
      console.error('Error al obtener datos del profesor:', error);
    }
  };

  // Función para obtener datos del aula
  const fetchAulaData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/aula/${encodeURIComponent(clase.aula)}`
      );
      if (response.ok) {
        const data = await response.json();
        setAulaData(data);
      } else {
        console.error('Error al obtener datos del aula');
      }
    } catch (error) {
      console.error('Error al obtener datos del aula:', error);
    }
  };

  // Función para obtener datos de la asignatura
  const fetchAsignaturaData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/asignatura/${encodeURIComponent(nombreAsignatura)}`
      );
      if (response.ok) {
        const data = await response.json();
        setAsignaturaData(data);
        setLoading(false);
      } else {
        console.error('Error al obtener datos de la asignatura');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al obtener datos de la asignatura:', error);
      setLoading(false);
    }
  };

  // Realizar las solicitudes de datos al montar el componente
  useEffect(() => {
    fetchAsignaturaData();
    fetchProfesorData();
    fetchAulaData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  // Construir 'horaClase' si no está definida
  const horaClase = clase.hora || `${clase.inicio} - ${clase.fin}`;

  return (
    <Dialog open={true} handler={onClose} size="lg">
      <DialogBody>
        <Typography variant="h5" className="mb-4">
          {nombreAsignatura}
        </Typography>

        {/* Mostrar información adicional de la asignatura */}
        <div className="mb-4 px-2">
          <div className="flex items-center mb-2">
            <FaClock className="h-5 w-5 mr-2" />
            <Typography>{horaClase || 'Hora no disponible'}</Typography>
          </div>
          {asignaturaData ? (
            <>
              <Typography className="flex gap-2">
                <span className="font-bold">Créditos:</span> {asignaturaData.numero_creditos}
              </Typography>
              <Typography className="flex gap-2">
                <span className="font-bold">Semestre:</span> {asignaturaData.semestre}
              </Typography>
              <Typography className="flex gap-2">
                <span className="font-bold">Tipo de Aula:</span> {asignaturaData.tipo_aula}
              </Typography>
            </>
          ) : (
            <div className="flex justify-center">
              <Spinner />
            </div>
          )}
        </div>

        {/* Información del Profesor */}
        <div className="mb-4">
          <Button
            variant="text"
            onClick={() => setProfesorOpen(!profesorOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <RiAccountCircleLine className="h-5 w-5 mr-2" />
              {clase.profesor}
            </div>
            <span>{profesorOpen ? '-' : '+'}</span>
          </Button>
          <Collapse open={profesorOpen}>
            {profesorData ? (
              <div className="p-4 border border-t-0">
                <Typography>Cédula: {profesorData.cedula}</Typography>
                <Typography className="mt-2 font-semibold">
                  Horarios Disponibles:
                </Typography>
                {Object.entries(profesorData.horarios_disponibles).map(
                  ([dia, horario]) => (
                    <Typography key={dia}>
                      {dia}: {horario.inicio} - {horario.fin}
                    </Typography>
                  )
                )}
              </div>
            ) : (
              <div className="flex justify-center">
                <Spinner />
              </div>
            )}
          </Collapse>
        </div>

        {/* Información del Aula */}
        <div className="mb-4">
          <Button
            variant="text"
            onClick={() => setAulaOpen(!aulaOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center">
              <FaMapMarkerAlt className="h-5 w-5 mr-2" />
              {clase.aula || 'Aula no disponible'}
            </div>
            <span>{aulaOpen ? '-' : '+'}</span>
          </Button>
          <Collapse open={aulaOpen}>
            {aulaData ? (
              <div className="p-4 border border-t-0">
                <Typography>Número de Aula: {aulaData.numero_aula}</Typography>
                <Typography>Capacidad: {aulaData.capacidad}</Typography>
                <Typography>Tipo: {aulaData.tipo}</Typography>
              </div>
            ) : (
              <div className="flex justify-center">
                <Spinner />
              </div>
            )}
          </Collapse>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button color="red" onClick={onClose}>
          Cerrar
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ClaseDetalle;
