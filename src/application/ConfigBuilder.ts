import { Environment } from "./Environment";
import { ModuleBase } from "./modules/ModuleBase";

// Is returned by a mod-block when called from the Config-builder
export interface ModBlockExport<T>{
    module: ModuleBase<T>,
    config: T
}

// Function for blockly-blocks that supplie mod-block-exports
export type ModBlockFunc<T> = (block: any, env: Environment)=>ModBlockExport<T>;
// Function for blockly-blocks that supplie values
export type SupplierFunc = (block: any)=>any;

class ConfigBuilder_{

    // Functions that generate the mod-block-exports from the blockly-blocks
    modblockGenerators: {[key: string]: ModBlockFunc<any>} = {};

    // Suppliers that return some values from inline-blockly-fields
    blockSuppliers: {[key: string]: SupplierFunc} = {};

    /**
     * Registers the generator for a module-block
     * @param name the name of the blockly-block that also got registered for blockly
     * @param onGenerate the generator that generates the mod-block-export
     */
    registerModuleBlock<T>(name: string, onGenerate: ModBlockFunc<T>) {
        this.modblockGenerators[name] = onGenerate;
    }

    /**
     * Registers the supplier for an inline-value supplier from blockly-inline-fields
     * @param name the name of the blockly-block that also got registered for blockly
     * @param onRequestSupply the supplier that returns the value from the required field 
     */
    registerValueSupplier(name: string, onRequestSupply: SupplierFunc){
        this.blockSuppliers[name] = onRequestSupply;
    }

    /**
     * Returns the value of a given supplier-block (Inline-blockly-block)
     * @param block the blockly-block
     */
    getValueFromSupplier(block: any): any{
        return this.blockSuppliers[block.type](block);
    }

    /**
     * Takes in the start block and then works its way down to generate all mod-block-exports
     * @param startBlock the starting block
     * @param env the environment that got supplied
     */
    generateModuleExports(startBlock: any, env: Environment): ModBlockExport<any>[]{
        // Next block
        var next = startBlock;

        // Contains all exports
        var exports: ModBlockExport<any>[] = [];

        // Generates the exports and moves to the next block
        while(next !== null){
            exports.push(this.modblockGenerators[next.type](next, env));

            next = next.getNextBlock();
        }

        return exports;
    }

}

export const ConfigBuilder = new ConfigBuilder_();