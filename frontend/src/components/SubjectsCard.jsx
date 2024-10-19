// src/components/SubjectsCard.jsx
import React from 'react';
import { Checkbox } from '@material-tailwind/react'; // Usamos Material Tailwind para los checkboxes

const SubjectsCard = ({ semester, subjects, handleSelectionChange }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Semester {semester}</h2>
      <ul>
        {subjects.map((subject, index) => (
          <li key={index} className="flex justify-between items-center mb-2">
            <span className="text-gray-700">{subject.nombre}</span>
            <Checkbox
              color="blue"
              checked={subject.selected || false} // Esto controlará si está marcado o no
              onChange={(e) => handleSelectionChange(subject, e.target.checked)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubjectsCard;
