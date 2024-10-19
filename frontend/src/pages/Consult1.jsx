import React, { useState, useEffect } from "react";
import axios from "axios";
import SubjectsCard from "../components/SubjectsCard";
import CalendarioClases from "../components/CalendarioClases";
import { CiCircleCheck } from "react-icons/ci";
import { Button, Breadcrumbs } from "@material-tailwind/react";
import { Link } from "react-router-dom";

const Consult1 = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [schedules, setSchedules] = useState([]); // Estado para los horarios

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/obtener_asignaturas")
      .then((response) => {
        const subjectsWithSelection = response.data.map((subject) => ({
          ...subject,
          selected: false,
        }));
        setSubjects(subjectsWithSelection);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching subjects:", error);
        setLoading(false);
      });
  }, []);

  const handleSelectionChange = (subject, isSelected) => {
    const updatedSubjects = subjects.map((s) =>
      s.nombre === subject.nombre && s.semestre === subject.semestre
        ? { ...s, selected: isSelected }
        : s
    );
    setSubjects(updatedSubjects);

    const updatedSelected = isSelected
      ? [...selectedSubjects, { ...subject, selected: isSelected }]
      : selectedSubjects.filter((s) => s.nombre !== subject.nombre);

    setSelectedSubjects(updatedSelected);
  };

  const getSubjectsBySemester = (semester) => {
    return subjects.filter((subject) => subject.semestre === semester);
  };

  const enviarDatosAProlog = async () => {
    if (selectedSubjects.length === 0) {
      setMessage("No hay asignaturas seleccionadas para enviar.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5001/api/enviar_datos_prolog",
        {
          asignaturas_seleccionadas: selectedSubjects,
          consulta: "1", // Indica que es la consulta 1
        }
      );

      console.log("Respuesta del backend:", response.data);

      if (response.data.horarios) {
        setSchedules(response.data.horarios);
        setMessage("Horarios generados correctamente.");
      } else {
        setMessage(response.data.error || "Error al generar horarios.");
      }
    } catch (error) {
      console.error("Error al enviar datos a Prolog:", error);
      setMessage("Error al enviar datos a Prolog");
    }
  };

  const volverASeleccionarMaterias = () => {
    setSchedules([]); // Volver a la vista de selección de materias
    setMessage("");
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
              <span className="text-sm text-gray-600"> ({subject.tipo_aula})</span>
            </li>
          ))}
        </ul>
        {/* Botón para enviar datos a Prolog */}
        <Button
          onClick={enviarDatosAProlog}
          size="lg"
          color="teal"
          className="mt-4 text-white font-bold py-2 px-4 rounded w-full p-2.5"
        >
          Generar horarios
        </Button>
        {message && (
          <div className="flex items-center mt-2 text-green-600">
            <CiCircleCheck className="text-4xl mr-2" />
            <p>{message}</p>
          </div>
        )}
      </aside>

      {/* Contenedor principal */}
      <div className="relative ml-64 p-4 w-full">
        {/* Breadcrumbs con separador automático */}
        <div className="absolute top-0 left-0 p-2 ml-2">
          <Breadcrumbs separator="/" className="flex items-center">
            {/* Primer enlace a Home con icono */}
            <Link to="/" className="opacity-60 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
            </Link>

            {/* Segundo enlace: Consulta 1 */}
            {schedules.length > 0 ? (
              <span
                onClick={volverASeleccionarMaterias}
                className="cursor-pointer text-teal-300"
              >
                Consulta 1
              </span>
            ) : (
              <Link to="/consult1" className="text-teal-300">
                Consulta 1
              </Link>
            )}
          </Breadcrumbs>
        </div>

        {/* Mostrar los horarios generados */}
        {schedules.length > 0 ? (
          <CalendarioClases schedules={schedules} />
        ) : (
          // Mostrar las materias si no hay horarios generados
          <div>
            <h2 className="text-xl font-bold mb-4 text-center">
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
