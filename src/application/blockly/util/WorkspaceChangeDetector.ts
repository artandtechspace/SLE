import { ModBlockExport } from "../../ConfigBuilder.js";
import { LoopModule, LoopModuleConfig } from "../../defaultModules/LoopModule.js";
import { hash53b } from "../../utils/CryptoUtil.js";

// Checksum of the previous blockly-configuration
var blocklyChecksum: number = 0;

// Takes in a mod-export object and returns only the raw config from it
function getConfig(exp: ModBlockExport<any>): any{

    if(exp.module === LoopModule){
        var cfg = exp.config as LoopModuleConfig;
        return {
            repeats: cfg.repeats,
            submodules: cfg.submodules.map(getConfig)
        };
    }

    return exp.config;
}

/**
 * Makes the workspace invalid so that the next scan will definitally go through
 */
export function setWorkspaceInvalid(){
    blocklyChecksum = 0;
}

/**
 * Takes in the exported workspace objects and returns if the changed
 */
// TODO: Might want to move the dragging-detection here
export function didWorkspaceChange(exports: ModBlockExport<any>[]){

    // Gets the raw configs (Without any blocks etc.)
    var rawCfg = exports.map(getConfig);

    // Generates the checksum only from the config-files
    var csum: number = hash53b(JSON.stringify(rawCfg));

    // Checks if the workspace did change
	if(csum !== blocklyChecksum){
        blocklyChecksum = csum;
        return true;
    }

    return false;

}