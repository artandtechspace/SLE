import { Config } from "../Config";
import { Environment } from "../Environment";
import { VariableSystem } from "../variablesystem/VariableSystem";
import { ModuleBase } from "../modules/ModuleBase";
import { ModuleReturn } from "../modules/ModuleReturn";

class TestModule extends ModuleBase{

    public generateCode(env : Environment, varSys : VariableSystem, config: Config) : string|ModuleReturn{
        
        // Gets the settings
        var x = config.getThrowError("x","x must be a number");        

        // Ensures that the number is a positiv integer
        if(!Number.isInteger(x) || x <= 0)
            throw "x must be a positiv number"
        
        // Gets some variables
        var ggSome = varSys.requestGlobalVariable("int", "someGG");
        var llSome = varSys.requestLocalVariable("int","yeet","5");


        return {
            setup: "led.setup("+x+");\n"+llSome.declair()+"\n"+llSome+" = 6;",
            loop: "// Some looo for led: "+x+";\nSpeaking of the devil: "+ggSome+"++;"
        }
    }
}

export default new TestModule();