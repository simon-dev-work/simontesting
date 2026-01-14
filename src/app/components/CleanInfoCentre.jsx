"use client"

import React from 'react';
import InfoCentreHomePage from '../pages/InfoCentreHomePage';

const CleanInfoCentre = () => {
  return (
    <div className="min-h-screen bg-white w-full">
      <InfoCentreHomePage clean={true} />
    </div>
  );
};

export default CleanInfoCentre;
