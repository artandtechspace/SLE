import { ModuleBase } from "../modules/ModuleBase.js";
import { CppFuncRegister, CppReturnType, CppTypeDefintion, CppFuncGeneratorFunction, CppFuncSupply, CppFuncParams } from "./CppFuncDefs.js";
import { FunctionSupplier } from "./CppFuncSupplier.js";
import { UniqueNameSupplier } from "./UniqueNameSupplier.js";
import { VariableSystem } from "./VariableSystem.js";

export class FunctionGenerator{

    private registeredFunctions: {[key:string]: CppFuncRegister<any>} = {};
    

    public registerCppFunc<T>(requester: ModuleBase<any>, name: string, returnType: CppReturnType, typeDef: CppTypeDefintion<T>, cfg: T, onGenerate: CppFuncGeneratorFunction<T>){
        // Gets the unique-key
        var key: string = requester.constructor.name+"_"+name;

        // Tries to get a config with that function
        var preCfg = this.registeredFunctions[key];

        // Checks if the module hasn't already registered it's function
        if(preCfg === undefined)
            // Registers the new function
            this.registeredFunctions[key] = {
                configs: [cfg],
                typeDef,
                module: requester,
                onGenerate: onGenerate,
                returnType,
                name
            };
        else
            // Just appends another config
            preCfg.configs.push(cfg);
    }

    /**
     * Takes in all configs of a module and returns a list with those values that are different in different configs.
     * @param configs the configs to check
     */
    private getConfigFieldsWithTypes<T>(configs: T[]){
        // Gets the compair-config
        var compareCfg: T = configs[0];

        // Will contain all config-fields with a flag that says if all configs have the same value for that one
        var fields = [];

        // Iterates iver every key of the configs
        for(let key in compareCfg){
            // Gets the value to compair to
            var value = compareCfg[key];

            // Checks if any config has a different value
            var allSame = configs.every(cfg=>cfg[key] === value);

            // Appends to the list
            fields.push({
                isStatic: allSame,
                name: key,
                value: allSame ? value : undefined
            });
        }

        return fields;
    }


    public toSupplier(varSys: VariableSystem, unqSup: UniqueNameSupplier) : FunctionSupplier{

        var fin: CppFuncSupply<any> = {};

        for(var name in this.registeredFunctions){
            var req: CppFuncRegister<any> = this.registeredFunctions[name];

            // Gets all values that are different
            var cfgFields = this.getConfigFieldsWithTypes(req.configs);

            var header = [];

            // All parameters that must be supplied to call the function
            var callParams: string[] = [];

            // All parameters witt the state if they are static or not and if they are with their static value
            var genParam: CppFuncParams<any> = {};

            for(var field of cfgFields){
                // Gets the type (float, int, bool, etc.)
                var type = req.typeDef[field.name];

                // If it's not static, append to the header
                if(!field.isStatic){
                    // Requests a local variable
                    var lVar = varSys.requestLocalVariable(type,"var");

                    header.push(`${type} ${lVar}`);

                    callParams.push(field.name);

                    genParam[field.name] = {
                        isStatic: false,
                        value: lVar
                    };
                }else{
                    genParam[field.name] = {
                        isStatic: true,
                        value: field.value
                    };
                }
            }

            // Generates the name
            var callName = unqSup.getUniqueNameFor(req.name);
            
            // Generate the header-string
            var headerStr = `${req.returnType} ${callName}(${header.join(",")})`;

            fin[name] = {
                header: headerStr,
                functionParameters: genParam,
                callParameters: callParams,
                typeDef: req.typeDef,
                module: req.module,
                onGenerate: req.onGenerate,
                callName
            };
        }

        return new FunctionSupplier(fin);
    }

}