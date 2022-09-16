import { Environment } from "./Environment";

// Objects that are shared
var workspaceRef: any;
var environmentRef: Environment;

// Callback handler when a new environment get's loaded
var onNewEnvLoadedCB: ()=>void;

export function initSharedObjects(workspace: any, env: Environment, onNewEnvLoaded: ()=>void){
    workspaceRef = workspace;
    environmentRef = env;
    onNewEnvLoadedCB = onNewEnvLoaded;
}

export function getWorkspace(){
    return workspaceRef;
}

export function getEnvironment(){
    return environmentRef;
}

export function loadNewEnvironment(env: Environment){
    environmentRef = env;
    
    // Executes the event
    onNewEnvLoadedCB();
}
