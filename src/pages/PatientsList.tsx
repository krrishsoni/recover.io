import React from 'react';
import { Navigate } from 'react-router-dom';

// This component redirects to the caregiver dashboard which shows the patients list
const PatientsList: React.FC = () => {
  return <Navigate to="/caregiver" replace />;
};

export default PatientsList;
