// src/components/ClaseDetalle.jsx
import React from 'react';
import { Dialog, DialogBody, DialogFooter, Button, Typography } from '@material-tailwind/react';
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa'; // Importar los íconos necesarios

const ClaseDetalle = ({ clase, onClose }) => {
  // Asegúrate de que 'clase' está definido
  if (!clase) {
    return null;
  }

  return (
    <Dialog open={true} handler={onClose} className="max-w-xl">
      <DialogBody>
        <Typography className="mb-4">
          {clase.nombre || 'Nombre de la Clase'}
        </Typography>
        <div className="flex items-center mb-4">
          {/* Mostrar el nombre del profesor */}
          <Typography >{clase.profesor}</Typography>
        </div>
        <div className="flex items-center mb-2">
          <FaClock className="h-5 w-5 mr-2 text-gray-600" />
          <Typography >{clase.hora || 'Hora no disponible'}</Typography>
        </div>
        <div className="flex items-center">
          <FaMapMarkerAlt className="h-5 w-5 mr-2 text-gray-600" />
          <Typography >{clase.aula || 'Aula no disponible'}</Typography>
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
