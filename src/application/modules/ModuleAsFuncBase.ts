import { ModuleCode } from "../codegenerator/CodeGenerator.js";
import { Environment } from "../Environment.js";
import { Arduino } from "../simulation/Arduino.js";
import { OpenObject, PositiveNumber } from "../types/Types.js";
import { CppFuncParams, CppTypeDefintion } from "../variablesystem/CppFuncDefs.js";
import { FunctionGenerator } from "../variablesystem/CppFuncGenerator.js";
import { FunctionSupplier } from "../variablesystem/CppFuncSupplier.js";
import { CppVoid } from "../variablesystem/CppTypes.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleBase } from "./ModuleBase.js";

/**
 * The module-base is the element that takes in a configuration file and generate the code based on the provided information and environment.
 */

export abstract class ModuleAsFuncBase<Config extends OpenObject> extends ModuleBase<Config>{
    
    // Name used for the function of the module
    private modName: string;

    constructor(modName :string){
        super();

        this.modName = modName;
    }

    public generateCode(env: Environment, varSys: VariableSystem, config: Config, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode{
        return {
            loop: funcSup.getCppFuncCall(this,this.modName,config),
            isDirty: this.isDirtyAfterExecution(env, config, isDirty)
        }
    }

    
    public registerFunction(env: Environment, config: Config, funcGen: FunctionGenerator): void {
        funcGen.registerCppFunc(this,this.modName,CppVoid,this.getCppTypeDefinition(),config,this.generateFunctionCode.bind(this));
    }
    
    public abstract getCppTypeDefinition() : CppTypeDefintion<Config>;
    public abstract isDirtyAfterExecution(env: Environment, cfg: Config, isDirty: boolean): boolean;
    public abstract generateFunctionCode(env: Environment, varSys: VariableSystem, funcParams: CppFuncParams<Config>) : string;
}