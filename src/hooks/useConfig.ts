import { useState, useEffect } from 'react';
import { getConfig, saveConfig } from '../db';
import { defaultConfig } from '../types';
import type { ConfigData } from '../types';

export function useConfig() {
  const [config, setConfig] = useState<ConfigData>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await getConfig();
      setConfig({ ...defaultConfig, ...data } as ConfigData);
    } catch (e) {
      console.error("Failed to load config", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (newConfig: ConfigData) => {
    await saveConfig(newConfig);
    setConfig(newConfig);
  };

  return { config, loading, updateConfig };
}
