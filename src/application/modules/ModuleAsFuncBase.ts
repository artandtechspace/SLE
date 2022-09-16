import { ModuleCode } from "../codegenerator/CodeGenerator";
import { OpenObject } from "../types/Types";
import { CppFuncParams, CppTypeDefintion } from "../codegenerator/variablesystem/CppFuncDefs";
import { FunctionGenerator } from "../codegenerator/variablesystem/CppFuncGenerator";
import { FunctionSupplier } from "../codegenerator/variablesystem/CppFuncSupplier";
import { CppVoid } from "../codegenerator/variablesystem/CppTypes";
import { VariableSystem } from "../codegenerator/variablesystem/VariableSystem";
import { ModuleBase } from "./ModuleBase";

/**
 * This module registers it's code by default as a function call
 */


export abstract class ModuleAsFuncBase<Config extends OpenObject> extends ModuleBase<Config>{
    
    // Name used for the function of the module inside the cpp-code
    private modName: string;

    constructor(modName :string){
        super();

        this.modName = modName;
    }

     /**
     * Returns the cpp-type-definition for the module's config
     */
      public abstract getCppTypeDefinition() : CppTypeDefintion<Config>;
      /**
       * Takes in the env, it's config and the previous dirty-state and returns if the leds are, after the module-code has, still dirty.
       */
      public abstract isDirtyAfterExecution(cfg: Config, isDirty: boolean): boolean;
      /**
       * This module must use this function to generate it's code. The normal generateCode method has already been overriden and will automatically call the function.
       */
      public abstract generateFunctionCode(varSys: VariableSystem, funcParams: CppFuncParams<Config>) : string;

    //#region Overrides

    public generateCode(varSys: VariableSystem, config: Config, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode{
        return {
            loop: funcSup.getCppFuncCall(this,this.modName,config),
            isDirty: this.isDirtyAfterExecution(config, isDirty)
        }
    }

    
    public registerFunction(config: Config, funcGen: FunctionGenerator): void {
        funcGen.registerCppFunc(this,this.modName,CppVoid,this.getCppTypeDefinition(),config,this.generateFunctionCode.bind(this));
    }

    //#endregion
}