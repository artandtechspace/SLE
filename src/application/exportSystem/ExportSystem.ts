
const Blockly = require("blockly");

export function exportToString(workspace: any){
    // Exports the workspace
    var wsExp = Blockly.serialization.workspaces.save(workspace);


}

export function importFromString(workspace: any, data: string){
    
}