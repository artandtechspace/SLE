import { exportToString, importFromString } from "../exportSystem/ExportSystem";
import { Language } from "../language/LanguageManager";
import { PROJECT_EXTENSION } from "../Preset";
import { create } from "../utils/HTMLBuilder";
import { APIBaseSimple } from "./APIWrapper";


// Shows an error-message to the user
const showErrorMessage = (title: string, text: string) : void => alert(`${title}\n${text}`);


// Handles the closing event on the browser side
function onBeforeClosing(evt: BeforeUnloadEvent){
    return evt.returnValue = `${Language.get("ui.preventpageleave")}\n${Language.get("ui.preventpageleave.detail")}`;
}

// Used to let the user open a file as a project
function importProject(){

    // Step 2
    // Event: When the text is finally read on
    function onReadText(evt: Event){
        try{
            // Gets the content
            var cont = (evt as any).target.result;
        
            // Tries to load the environment from that file
            importFromString(cont);
        }catch(exc){
            showErrorMessage(
                Language.get("import.error.title"),
                (exc as Error).message
            );
        }
    }

    // Step 1
    // Event: When the file is beeing loaded
    function onLoadFile(evt: Event){
        var file = (evt as any).target.files[0];
        if (!file)
            return false;

        var reader = new FileReader();
        reader.onload = onReadText;
        reader.readAsText(file);

        return false;
    }

    // Creates the file-input-element
    var impBtn = create("input", { attr: { type: "file", style:"display: none" }, evts: { change: onLoadFile }});

    // Clicks the element
    impBtn.click();
}

// Lets the user save the current project as a file
function saveProject(){
    // Exports
    var data = exportToString();

    // Creates the file
    var file = new Blob([data],{
        endings: "native",
        type: "text/"+PROJECT_EXTENSION
    });

    // Creates an element to download the element
    var a = document.createElement("a");
    var url = a.href = URL.createObjectURL(file);
    // TODO: Edit to something else than just "Export.[PROJECT_EXTENSION]"
    a.download = "Export."+PROJECT_EXTENSION;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0); 
}

// Opens the given url inside a new blank window
const openURL=(url: string)=>window.open(url, '_blank');

export const createBrowserAPI = () : APIBaseSimple => {return{
    showErrorMessage,
    onBeforeClosing,
    importProject,
    exportProject: saveProject,
    openURL,

    // Not supported
    openElectronDevTools: ()=>{},
    closeElectronWindow: ()=>{}
}}