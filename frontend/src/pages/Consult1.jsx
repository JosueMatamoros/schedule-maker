// src/pages/Consult1.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SubjectsCard from '../components/SubjectsCard';

const Consult1 = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5001/api/obtener_asignaturas')
      .then(response => {
        const subjectsWithSelection = response.data.map(subject => ({
          ...subject,
          selected: false, // Agregar campo para controlar el checkbox
        }));
        setSubjects(subjectsWithSelection);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching subjects:', error);
        setLoading(false);
      });
  }, []);

  const handleSelectionChange = (subject, isSelected) => {
    // Actualizar el estado de las materias
    const updatedSubjects = subjects.map(s =>
      s.nombre === subject.nombre && s.semestre === subject.semestre
        ? { ...s, selected: isSelected }
        : s
    );
    setSubjects(updatedSubjects);

    // Actualizar la lista de materias seleccionadas
    const updatedSelected = isSelected
      ? [...selectedSubjects, subject]
      : selectedSubjects.filter(s => s.nombre !== subject.nombre);

    setSelectedSubjects(updatedSelected);
  };

  const getSubjectsBySemester = (semester) => {
    return subjects.filter(subject => subject.semestre === semester);
  };

  const enviarDatosAProlog = async () => {
    if (selectedSubjects.length === 0) {
      setMessage('No hay asignaturas seleccionadas para enviar.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/enviar_datos_prolog', {
        asignaturas_seleccionadas: selectedSubjects
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error al enviar datos a Prolog:', error);
      setMessage('Error al enviar datos a Prolog');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex">
      {/* Sidebar de materias seleccionadas */}
      <aside className="w-64 h-screen bg-gray-50 p-4 fixed left-0 top-0">
        <h3 className="text-lg font-bold mb-4">Selected Subjects:</h3>
        <ul>
          {selectedSubjects.map((subject, index) => (
            <li key={index} className="mb-2">
              {subject.nombre}
              {/* Tipo de aula solo en los seleccionados */}
              <span className="text-sm text-gray-600"> ({subject.tipo_aula})</span>
            </li>
          ))}
        </ul>
        {/* Botón para enviar datos a Prolog */}
        <button
          onClick={enviarDatosAProlog}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Send to Prolog
        </button>
        {message && <p className="mt-2 text-green-600">{message}</p>}
      </aside>

      {/* Contenedor principal */}
      <div className="ml-64 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(7).keys()].map(semestre => (
          <SubjectsCard
            key={semestre}
            semester={semestre + 1}
            subjects={getSubjectsBySemester(semestre + 1)}
            handleSelectionChange={handleSelectionChange}
          />
        ))}
      </div>
    </div>
  );
};

export default Consult1;
