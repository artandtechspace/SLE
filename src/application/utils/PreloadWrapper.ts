/**
 * This wrapper is used to access nodejs methods and functions from within the browser-window
 * 
 * Using carefully defined access-points inside the preload.js (Which is the preloaded script that has direct access to the IPC-Tool)
 * we can ask the main process to do specific stuff and return the results.
 * 
 * The Accesspoints are defined inside the preload.js (Window/Renderer process)
 * and the Endpoints that actually do that stuff are defined inside the main index.js (Electron/Main process)
 * 
 * And this is just the typescript-wrapper to access these functions
 */

import { Language } from "../language/LanguageManager";

// Reference to the electron-api that lives inside the electronAPI-object
const EAPI = (window as any).electronAPI;

// Shows an error-message to the user
const showErrorMessage = (title: string, text: string) : void => EAPI.showErrorMessage(title, text);

// Askes the user if the application should close
const askForClosing = () : boolean => EAPI.askForClosing(
    // Text
    Language.get("ui.preventpageleave"),
    // Subtext
    Language.get("ui.preventpageleave.detail"),
    // Yes-button
    Language.get("ui.preventpageleave.yes"),
    // No-button
    Language.get("ui.preventpageleave.no")
);

export const API = {
    askForClosing,
    showErrorMessage
}