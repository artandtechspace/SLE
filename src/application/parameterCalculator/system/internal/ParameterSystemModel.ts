import { getEnvironment } from "../../../SharedObjects";
import { isValidParameterName } from "../../ParameterCheck";
import { SysParameterModel, UParameterModel } from "./ParameterSystemTypes";

// All system-parameter names
export const SystemParams = {
    LED_AMOUNT: "ledAmount"
};

export enum ErrorType {
    DUPLICATED_NAME,
    INVALID_VALUE,
    INVALID_NAME
}

type Error = {
    instanceId: number,
    type: ErrorType
}

// Handles all logic regarding the parameter-data handling
export class ParameterSystemModel {

    // Id counter to internally uniquely identify parameters in one (Program)-instance
    private idCounter = 0;

    // Holds all user-parameters that are currently present inside the system
    private userparams: UParameterModel[] = [];

    // Holds all system-parameters that are static inside the system and will dynamically change
    private sysparams: SysParameterModel[] = [];

    // List with errors (Is refreshed by calling the checkForErrors-method)
    private errorList: Error[] = [];

    /**
     * Initalizes the prameter-system-model
     * This is used to initalize all system-parameters.
     */
    public init(){
        // Creates the default system parameters
        this.createSystemParameter(SystemParams.LED_AMOUNT, ()=> getEnvironment().ledAmount);
    }

    // Updates the internal error-check, which can be read using the getErrorParameters-method
    public checkForErrors(){
        // Clears the error-list
        this.errorList = [];

        // Local set with duplicated names (Prevents duplicated error message for duplicated names xD)
        var duplicatedNames = new Set<number>(); 

        // Checks every uparam for any errors
        for(var param of this.userparams){

            // Checks for an invalid value
            if(isNaN(param.value))
                this.errorList.push({
                    type: ErrorType.INVALID_VALUE,
                    instanceId: param.instanceId
                });

            // Checks if the name is invalid
            if(!isValidParameterName(param.name))
                this.errorList.push({
                    instanceId: param.instanceId,
                    type: ErrorType.INVALID_NAME
                })

            // Checks the name against every other parmeter (For duplicated names)
            for(var mdl2 of this.userparams){
                // Ensures no self-checks
                if(param.instanceId === mdl2.instanceId)
                    continue;
                
                // Checks if the name matches
                if(param.name === mdl2.name){
                    duplicatedNames.add(param.instanceId);
                    duplicatedNames.add(mdl2.instanceId);
                }
            }

            // Checks the name against every system-parameter (For duplicated names)
            for(var sysPrm of this.sysparams)
                if(sysPrm.name === param.name){
                    duplicatedNames.add(param.instanceId);
                    break;
                }
         }

         // Appends the duplication error also to the error list
         duplicatedNames.forEach(err=>this.errorList.push({
            instanceId: err,
            type: ErrorType.DUPLICATED_NAME
         }));
    }

    // Creates a user-parameter only on the model, the view will not be influenced by this
    public createUserParameter(name: string, value: number) : UParameterModel{
        var prm: UParameterModel = {
            instanceId: this.idCounter++,
            name: name,
            value: value
        };

        this.userparams.push(prm);

        return prm;
    }

    /**
     * Creates a system-parameter only on the model, the view will not be influenced by this.
     * This shall only be called inside the init-method
     */
    private createSystemParameter(name: string, getter: ()=>number) : SysParameterModel{
        var prm: SysParameterModel = {
            name,
            getter
        };

        this.sysparams.push(prm);

        return prm;
    }

    // Takes in an instance-id
    public getUParameterByInstanceId(instanceId: number){
        return this.userparams.find(x=>x.instanceId===instanceId);
    }

    // Updates the name of a user-parameter with the given instance-id (Wont update the view automatically)
    public updateName(instanceId: number, name: string){
        this.getUParameterByInstanceId(instanceId)!.name = name;
    }

    // Updates the value of a user-parameter with the given instance-id (Wont update the view automatically)
    public updateValue(instanceId: number, value: number){
        this.getUParameterByInstanceId(instanceId)!.value = value;
    }

    // Delete the user-parameter with the given instance-id (Wont update the view automatically)
    public deleteUParameter(instanceId: number){
        this.userparams = this.userparams.filter(x=>x.instanceId !== instanceId);
    }

    /**
     * Takes in a name from eigther a system- or userparameter and returns the value of it.
     * 
     * Ensure that no parameter has any errors, otherwise the method could return unexpected values.
     * (Basically refresh the error-check and make sure there are no errors)
     * 
     * @throws {LanguageRef} the error message if the given parameter couldn't be found
     */
    public getParamValueByName(name: string) : number {

        // Tries the system-parameters first
        var sysprm = this.sysparams.find(prm=>prm.name===name);

        if(sysprm !== undefined)
            return sysprm.getter();

        // Tries to user-parameters secondly
        var usrprm = this.userparams.find(prm=>prm.name===name);

        if(usrprm !== undefined)
            return usrprm.value;

        // Parameter couldn't be found
        throw {key: "calc.param.error.solver.paramnotfound", vars: name};
    }

    // Deletes all user-parameters (Wont update the view automatically)
    public deleteAllUParameters(){
        this.userparams = [];
    }


    // Returns all errors that got found by the checkForErrors method
    public getErrorParameters(){
        return this.errorList;
    }

    // Returns all user-parameter
    public getUParameters(){
        return this.userparams;
    }

    // Returns all system-parameter
    public getSysParameters(){
        return this.sysparams;
    }
}