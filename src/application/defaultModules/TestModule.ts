import { Environment } from "../Environment.js";
import { VariableSystem } from "../variablesystem/VariableSystem.js";
import { ModuleBase } from "../modules/ModuleBase.js";
import { printIf as pif } from "../utils/WorkUtils.js";
import { getFLEDColorDefinition } from "../utils/ColorUtils.js";
import { Arduino } from "../simulation/Arduino.js";
import { HexColor, Min, OpenObject, PositiveNumber as PositiveNumber } from "../types/Types.js";
import { Variable } from "../variablesystem/Variable.js";
import { ModuleCode } from "../codegenerator/CodeGenerator.js";
import { FunctionGenerator } from "../variablesystem/CppFuncGenerator.js";
import { CppInt, CppVoid } from "../variablesystem/CppTypes.js";
import { FunctionSupplier } from "../variablesystem/CppFuncSupplier.js";
import { CppFuncParam } from "../variablesystem/CppFuncDefs.js";

export type TestModuleConfig = {
    length: Min<1>,
    rgbHex: HexColor
};

class TestModule_ extends ModuleBase<TestModuleConfig>{

    public registerFunction(env: Environment, config: TestModuleConfig, funcGen: FunctionGenerator): void {
        funcGen.registerCppFunc(this,"test",CppVoid,{
            length: CppInt,
            rgbHex: CppInt
        },config,this.generateFunctionBody.bind(this));
    }

    public generateCode(env: Environment, varSys: VariableSystem, config: TestModuleConfig, funcSup: FunctionSupplier, isDirty: boolean): ModuleCode {
        return {
            loop: funcSup.getCppFuncCall(this,"test",config),
            isDirty: true
        };
    }

    public generateFunctionBody(env: Environment, varSys: VariableSystem, params: { length: CppFuncParam<number>; rgbHex: CppFuncParam<string>; }): string {
        return `
            leds[${params.length.value}] = ${params.rgbHex.value};
        `;
    }

}

export const TestModule = new TestModule_();