import { createBrowserAPI } from "./BrowserAPI";
import { createElectronAPI } from "./ElectronAPI";

// Reference to the useable api
var api: APIBase;

// Returns if the current environment is a browser (true) or electron (false)
const isBrowserEnv=() : boolean => (window as any).electronAPI === undefined;

// Must be called before the app initalizes to get the correct api based on the environment
export function preIntializeApi(){
    // If it's a browser env
    const isBrowser = isBrowserEnv();

    api = {
        // Imports the specific implementations
        ...(isBrowser ? createBrowserAPI() : createElectronAPI()),

        // Adds version stuff
        isBrowser: ()=>isBrowser,
        isElectron: ()=>!isBrowser,
    };
}

// Returns the api useable for the current environment
export const getApi=()=>api;

export interface APIBaseSimple {
    // Event to handle directly before unloading the webpage. Used to ask the user if he wants to save progress
    onBeforeClosing: (evt: BeforeUnloadEvent)=>any
    // Shows a given error-message (Using title and text) to the user
    showErrorMessage: (title: string, text: string)=>void,
    // Lets the user open a file to import a project
    importProject: ()=>void,
    // Lets the user save the current project as a file
    exportProject: ()=>void
}

export interface APIBase extends APIBaseSimple{
    // Returns if the current environment is the browser
    isBrowser(): boolean
    // Returns if the current environment is electron
    isElectron(): boolean
}