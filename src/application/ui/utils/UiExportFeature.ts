
// Reference to the workspace
var workspaceRef: any;

export function setupExportFeature(workspace: any, exportBtn: HTMLInputElement, importBtn: HTMLInputElement){
    workspaceRef = workspace;

    // Sets the ui-events
    exportBtn.onclick = onExportFileButtonClicked;
    importBtn.onclick = onImportFileButtonClicked;
}

// Event: When the export button get's clicked
function onExportFileButtonClicked(){

}

// Event: When the import button get's clicked
function onImportFileButtonClicked(){

}