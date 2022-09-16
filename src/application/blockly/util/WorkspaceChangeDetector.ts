import { ModBlockExport } from "../../ConfigBuilder";
import { LoopModule, LoopModuleConfig } from "../../defaultModules/LoopModule";
import { hash53b } from "../../utils/CryptoUtil";

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
export function didWorkspaceChange(setupExpots: ModBlockExport<any>[], loopExports: ModBlockExport<any>[]){

    // Gets the raw configs (Without any blocks etc.)
    var rawSetupCfg = setupExpots.map(getConfig);
    var rawLoopCfg = loopExports.map(getConfig);

    // Generates the checksum only from the config-files
    var csum: number = hash53b(JSON.stringify({rawLoopCfg, rawSetupCfg}));

    // Checks if the workspace did change
	if(csum !== blocklyChecksum){
        blocklyChecksum = csum;
        return true;
    }

    return false;

}