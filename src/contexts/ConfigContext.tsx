
import React, { createContext, useState, useContext, useEffect } from 'react';

interface Config {
  headerLink: string;
  basePath: string;
  apiBaseUrl: string;
  isLoaded: boolean;
}

// Default config for development environment
const defaultConfig: Config = {
  headerLink: '',
  basePath: '/',
  apiBaseUrl: '',
  isLoaded: false
};

interface ConfigContextType {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Always fetch from /config endpoint
        const response = await fetch('/config');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }
        
        const data = await response.json();
        
        setConfig({
          headerLink: data.headerLink || defaultConfig.headerLink,
          basePath: data.basePath || defaultConfig.basePath,
          apiBaseUrl: data.apiBaseUrl || defaultConfig.apiBaseUrl,
          isLoaded: true
        });
        
        console.log('Config loaded:', {
          headerLink: data.headerLink,
          basePath: data.basePath,
          apiBaseUrl: data.apiBaseUrl
        });
      } catch (error) {
        console.error('Failed to load configuration:', error);
        // If we can't load config, use defaults but mark as loaded
        setConfig({
          ...defaultConfig,
          isLoaded: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
