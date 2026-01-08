import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // Default settings
  const defaultSettings = {
    language: 'en',
    editorMode: 'basic'
  };

  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('nova-xfinity-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Merge with defaults to ensure all keys exist
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error('Failed to parse settings from localStorage:', error);
    }
    return defaultSettings;
  });

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('nova-xfinity-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return React.createElement(
    SettingsContext.Provider,
    {
      value: {
        language: settings.language,
        editorMode: settings.editorMode,
        settings, // Provide full settings object for convenience
        updateSettings
      }
    },
    children
  );
};
