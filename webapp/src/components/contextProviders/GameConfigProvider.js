import { Component } from "react";
import { createContext, useContext, useState, useEffect } from "react";

const ConfigContext = createContext();

const defaultConfig = { questions: 30, timePerRound: 120, topics: [] };

/**
 * Provider for the game configuration, it will store the configuration in the local storage
 * 
 * @param {Component} children Component that will be wrapped by the provider
 * @returns 
 */
export const GameConfigProvider = ({ children }) => {
    
    // State to store the configuration
    // its initial value is the value stored in the local storage
    const [config, setConfig] = useState(() => {
        const savedConfig = localStorage.getItem("gameConfig");
        return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
    });

    // Save the configuration in the local storage when it changes
    useEffect(() => {
        localStorage.setItem("gameConfig", JSON.stringify(config));
    }, [config]);

    // Function to reset the configuration to the default values
    const resetConfig = () => {
        setConfig(defaultConfig);
        localStorage.setItem("gameConfig", JSON.stringify(defaultConfig));
    }

    return (
        <ConfigContext.Provider value={{ config, setConfig, resetConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    return useContext(ConfigContext);
};

export default ConfigContext;