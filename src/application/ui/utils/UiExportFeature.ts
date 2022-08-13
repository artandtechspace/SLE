import { exportToString, importFromString } from "../../exportSystem/ExportSystem.js";

export function setupExportFeature(exportBtn: HTMLInputElement, importBtn: HTMLInputElement, importHelperButton: HTMLInputElement){
    // Sets the ui-events
    exportBtn.onclick = onExportFileButtonClicked;
    importHelperButton.onchange = onImportFileButtonClicked;
    importBtn.onclick = ()=>importHelperButton.click();
}

// Event: When the export button get's clicked
function onExportFileButtonClicked(){
    // Exports
    var data = exportToString();

    // Creates the file
    var file = new Blob([data],{
        endings: "native",
        type: "text/json"
    });

    // Creates an element to download the element
    var a = document.createElement("a");
    var url = a.href = URL.createObjectURL(file);
    // TODO: Edit to something else than just "Export.json"
    a.download = "Export.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0); 
}

// Event: When the import button get's clicked
function onImportFileButtonClicked(evt: any){
    var file = evt.target.files[0];
    if (!file)
        return false;

    var reader = new FileReader();
    reader.onload = onImportFile;
    reader.readAsText(file);

    // Reset
    evt.target.value = "";

    return false;
}

// Event: When the user has selected a file to upload
function onImportFile(evt: any){
    try{
        // Gets the content
        var cont = evt.target.result;
    
        // Tries to load the environment from that file
        importFromString(cont);
    }catch(exc){
        // TODO: Implement using popup-system
        alert(exc);
    }
}