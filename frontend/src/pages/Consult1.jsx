// src/pages/Consult1.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SubjectsCard from '../components/SubjectsCard';
import CalendarioClases from '../components/CalendarioClases';
import { CiCircleCheck } from "react-icons/ci";

const Consult1 = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [message, setMessage] = useState('');
  const [schedules, setSchedules] = useState([]); // Estado para los horarios

  useEffect(() => {
    axios
      .get('http://localhost:5001/api/obtener_asignaturas')
      .then((response) => {
        const subjectsWithSelection = response.data.map((subject) => ({
          ...subject,
          selected: false,
        }));
        setSubjects(subjectsWithSelection);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching subjects:', error);
        setLoading(false);
      });
  }, []);

  const handleSelectionChange = (subject, isSelected) => {
    // Actualizar el estado de las materias
    const updatedSubjects = subjects.map((s) =>
      s.nombre === subject.nombre && s.semestre === subject.semestre
        ? { ...s, selected: isSelected }
        : s
    );
    setSubjects(updatedSubjects);

    // Actualizar la lista de materias seleccionadas
    const updatedSelected = isSelected
      ? [...selectedSubjects, subject]
      : selectedSubjects.filter((s) => s.nombre !== subject.nombre);

    setSelectedSubjects(updatedSelected);
  };

  const getSubjectsBySemester = (semester) => {
    return subjects.filter((subject) => subject.semestre === semester);
  };

  const enviarDatosAProlog = async () => {
    if (selectedSubjects.length === 0) {
      setMessage('No hay asignaturas seleccionadas para enviar.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5001/api/enviar_datos_prolog',
        {
          asignaturas_seleccionadas: selectedSubjects,
          consulta: '1', // Indica que es la consulta 1
        }
      );

      // Imprimir la respuesta del backend en la consola
      console.log('Respuesta del backend:', response.data);

      if (response.data.horarios) {
        setSchedules(response.data.horarios);
        setMessage('Horarios generados correctamente.');
      } else {
        setMessage(response.data.error || 'Error al generar horarios.');
      }
    } catch (error) {
      console.error('Error al enviar datos a Prolog:', error);
      setMessage('Error al enviar datos a Prolog');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Cargando asignaturas...</div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar de materias seleccionadas */}
      <aside className="w-64 h-screen bg-gray-50 p-4 fixed left-0 top-0 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Materias seleccionadas:</h3>
        <ul>
          {selectedSubjects.map((subject, index) => (
            <li key={index} className="mb-2">
              {subject.nombre}
              <span className="text-sm text-gray-600">
                {' '}
                ({subject.tipo_aula})
              </span>
            </li>
          ))}
        </ul>
        {/* Botón para enviar datos a Prolog */}
        <button
          onClick={enviarDatosAProlog}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Generar Horarios
        </button>
        {message && (
          <div className="flex items-center mt-2 text-green-600">
            <CiCircleCheck className="text-4xl mr-2" />
            <p>{message}</p>
          </div>
        )}
      </aside>

      {/* Contenedor principal */}
      <div className="ml-64 p-4 w-full">
        {/* Mostrar los horarios generados */}
        {schedules.length > 0 ? (
          <CalendarioClases schedules={schedules} />
        ) : (
          // Mostrar las materias si no hay horarios generados
          <div>
            <h2 className="text-xl font-bold mb-4">
              Selecciona las materias para generar horarios
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(7).keys()].map((semestre) => (
                <SubjectsCard
                  key={semestre}
                  semester={semestre + 1}
                  subjects={getSubjectsBySemester(semestre + 1)}
                  handleSelectionChange={handleSelectionChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consult1;
