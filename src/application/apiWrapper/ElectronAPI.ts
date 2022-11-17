
import { exportToString, importFromString } from "../exportSystem/ExportSystem";
import { Language } from "../language/LanguageManager";
import { PROJECT_EXTENSION } from "../Preset";
import { getEnvironment } from "../SharedObjects";
import { makeValidFilename } from "../utils/FileUtils";
import { APIBaseSimple as APIBaseSimple } from "./APIWrapper";

// Used for save and open file dialogs
type FileFilters = {
    name: string, extensions: string[]
}

interface ElectronApi {
    showErrorMessage: (title: string, text: string)=>void,
    askForClosing: (text: string, textDetail: string, yesBtnText: string, noBtnText: string)=>boolean,
    showOpenFileDialog: (title: string, buttonLabel: string, filters: FileFilters[])=>string|undefined
    readInProjectFile: (path: string)=>string,
    showSaveFileDialog: (title: string, buttonLabel: string, filters: FileFilters[], defaultPath: string)=>string|undefined,
    saveFile: (path: string, data: string)=>string|true,
    openURL: (url: string)=>void,
    openDevTools: ()=>void,
    closeWindow: ()=>void
}

// Reference to the electron-api that lives inside the electronAPI-object
// (This object is defined inside the preload.js-file)
const EAPI : ElectronApi = (window as any).electronAPI;


// Shows an error-message to the user
const showErrorMessage = (title: string, text: string) : void => EAPI.showErrorMessage(title, text);

// If the window should close
// Because of a bug, electron can interrupt the beforeunload event with an api-call.
// Therefor we use a simelar trick to get around this as this user: https://github.com/electron/electron/issues/7977#issuecomment-267430262
var closeWindow = false

// Handles the closing event on the electron side
function onBeforeClosing(evt: BeforeUnloadEvent){

    // Returns if the window shall close
    if(closeWindow) return;

    // Always prevents
    evt.returnValue = false;

    // Askes the user
    setTimeout(()=>closeWindow = EAPI.askForClosing(
        // Text
        Language.get("ui.preventpageleave"),
        // Subtext
        Language.get("ui.preventpageleave.detail"),
        // Yes-button
        Language.get("ui.preventpageleave.yes"),
        // No-button
        Language.get("ui.preventpageleave.no")
    ));
}

// Used to let the user open a file as a project
function importProject(){

    // Prompts the user to select the file
    var file = EAPI.showOpenFileDialog(
        Language.get("import.dialog.title"),
        Language.get("import.dialog.open"),
        [
            { name: Language.get("import.dialog.filename"), extensions: [PROJECT_EXTENSION] },
            { name: Language.get("import.dialog.filename.other"), extensions: ["*"]}
        ]
    );

    // Checks if a file got selected
    if(file === undefined)
        return;

    // Reads in the content
    var content = EAPI.readInProjectFile(file);
    
    // Checks for a readin-error
    if(content === undefined){
        EAPI.showErrorMessage(
            Language.get("import.error.title"),
            Language.get("import.error.read")
        );
        return;
    }

    try{
        // Tries to load the environment from that file
        importFromString(content, file);
    }catch(exc){
        showErrorMessage(
            Language.get("import.error.title"),
            (exc as Error).message
        );
    }
}

// Lets the user save the current project as a file
function exportProject(saveAs: boolean){

    // Gets the file-path from the loaded environment
    var file : string|undefined = getEnvironment().savePath;

    // Checks if the save-path isn't given or if the file should be saved elsewhere
    if(file === undefined || saveAs){
        // Prompts the user to select the file
        file = EAPI.showSaveFileDialog(
            Language.get("export.dialog.title"),
            Language.get("export.dialog.save"),
            [
                { name: Language.get("import.dialog.filename"), extensions: [PROJECT_EXTENSION] },
                { name: Language.get("import.dialog.filename.other"), extensions: ["*"]}
            ],
            // Filename for the exported file
            makeValidFilename(getEnvironment().projectName+"."+PROJECT_EXTENSION)
        );

        // Checks if the selection got cancled
        if(file === undefined)
            return;

        // Updates the path
        getEnvironment().savePath = file;
    }

    // Tries to save the project
    var result = EAPI.saveFile(file, exportToString());
    
    if(result !== true){
        // Logs the error
        console.error("Failed to open file",result);        

        // Shows the error
        showErrorMessage(
            Language.get("export.error.title"),
            Language.get("export.error.desc")
        );
    }
}

// Opens the given url inside the system-browser
const openURL=(url: string) => EAPI.openURL(url);

export const createElectronAPI = () : APIBaseSimple => {return{
    showErrorMessage,
    onBeforeClosing,
    importProject,
    exportProject,
    openURL,

    // Electron only
    openElectronDevTools: ()=> EAPI.openDevTools(),
    closeElectronWindow: ()=> EAPI.closeWindow()
}}