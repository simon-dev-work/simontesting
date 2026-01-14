// src/contexts/SettingsContext.js
import React, { createContext, useState, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    bannerImage: '',
    overlayColor: '#000000',
    overlayOpacity: 0.5,
    showCounterPanel: true,
    showConnectPanel: true,
    servicesTitle: 'Our Services',
  });

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};