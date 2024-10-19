import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SubjectsCard from '../components/SubjectsCard';
import HorariosConsulta2 from '../components/HorariosConsulta2';
import { Button, ButtonGroup } from "@material-tailwind/react"; // Importar Button y ButtonGroup
import { CiCircleCheck } from "react-icons/ci";

const Consult2 = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [message, setMessage] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [filterState, setFilterState] = useState({ par: false, impar: false }); // Estado para manejar la selección de pares e impares
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5001/api/obtener_asignaturas')
      .then(response => {
        const subjectsWithSelection = response.data.map(subject => ({
          ...subject,
          selected: false,
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
    const updatedSubjects = subjects.map(s =>
      s.nombre === subject.nombre && s.semestre === subject.semestre
        ? { ...s, selected: isSelected }
        : s
    );
    setSubjects(updatedSubjects);

    const updatedSelected = isSelected
      ? [...selectedSubjects, subject]
      : selectedSubjects.filter(s => s.nombre !== subject.nombre);

    setSelectedSubjects(updatedSelected);
  };

  const getSubjectsBySemester = (semester) => {
    return subjects.filter(subject => subject.semestre === semester);
  };

  // Manejar la selección o limpieza de los semestres pares o impares
  const handleFilterSemesters = (type) => {
    const isPar = type === 'par';
    const shouldSelect = !filterState[type]; // Si el filtro no está activo, seleccionamos, de lo contrario, deseleccionamos.

    const updatedSubjects = subjects.map(subject => {
      if ((isPar && subject.semestre % 2 === 0) || (!isPar && subject.semestre % 2 !== 0)) {
        return { ...subject, selected: shouldSelect };
      }
      return subject;
    });

    setSubjects(updatedSubjects);
    setSelectedSubjects(updatedSubjects.filter(subject => subject.selected));
    setFilterState({ ...filterState, [type]: shouldSelect });
  };

  const enviarDatosAProlog = async () => {
    if (selectedSubjects.length === 0) {
      setMessage('No hay asignaturas seleccionadas para enviar.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/enviar_datos_prolog', {
        asignaturas_seleccionadas: selectedSubjects,
        consulta: '2'
      });

      console.log('Respuesta del backend:', response.data);

      if (response.data.horarios) {
        setSchedules(response.data.horarios);
        setMessage('Horarios generados correctamente.');
        setShowFilters(false); // Ocultar los botones de filtro cuando se generen los horarios
      } else {
        setMessage(response.data.error || 'Error al generar horarios.');
      }
    } catch (error) {
      console.error('Error al enviar datos a Prolog:', error);
      setMessage('Error al enviar datos a Prolog');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="flex">
      {/* Sidebar de materias seleccionadas */}
      <aside className="w-64 h-screen bg-gray-50 p-4 fixed left-0 top-0 overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Materias seleccionadas:</h3>
        <ul>
          {selectedSubjects.map((subject, index) => (
            <li key={`subject-${subject.id || `subject-${index}`}`} className="mb-2">
              {subject.nombre}
              <span className="text-sm text-gray-600"> ({subject.tipo_aula})</span>
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

        {showFilters && (
          <div className="mt-4">
            {/* ButtonGroup para seleccionar pares o impares */}
            <ButtonGroup variant="gradient" fullWidth>
              <Button onClick={() => handleFilterSemesters('par')}>
                {filterState.par ? 'Limpiar Pares' : 'Pares'}
              </Button>
              <Button onClick={() => handleFilterSemesters('impar')}>
                {filterState.impar ? 'Limpiar Impares' : 'Impares'}
              </Button>
            </ButtonGroup>
          </div>
        )}

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
          <HorariosConsulta2 schedules={schedules} />
        ) : (
          // Mostrar las materias si no hay horarios generados
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(7).keys()].map(semestre => (
              <SubjectsCard
                key={`semestre-${semestre}`}
                semester={semestre + 1}
                subjects={getSubjectsBySemester(semestre + 1)}
                handleSelectionChange={handleSelectionChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Consult2;
