import { Language } from "../language/LanguageManager";
import { APIBaseSimple } from "./APIWrapper";


// Shows an error-message to the user
const showErrorMessage = (title: string, text: string) : void => alert(`${title}\n${text}`);


// Handles the closing event on the browser side
function onBeforeClosing(evt: BeforeUnloadEvent){
    return evt.returnValue = `${Language.get("ui.preventpageleave")}\n${Language.get("ui.preventpageleave.detail")}`;
}

export const createBrowserAPI = () : APIBaseSimple => {return{
    showErrorMessage,
    onBeforeClosing
}}