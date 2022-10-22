
import { Language } from "../language/LanguageManager";
import { APIBaseSimple as APIBaseSimple } from "./APIWrapper";


// Reference to the electron-api that lives inside the electronAPI-object
const EAPI = (window as any).electronAPI;


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

export const createElectronAPI = () : APIBaseSimple => {return{
    showErrorMessage,
    onBeforeClosing
}}