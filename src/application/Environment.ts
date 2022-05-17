import { SystemError } from "./errorSystem/Error.js";
import { isMin, Min, OpenObject, PositiveNumber } from "./types/Types.js";
import { PREVIEWS } from "./ui/utils/UiEnvironmentIntegration.js";
import { isInteger } from "./utils/WorkUtils.js";

export class Environment{

    public withComments : boolean;
    public ledAmount : Min<1>;
    public preprocessingCode: string;
    public ledPin : PositiveNumber;
    public selectedPreview: string;

    public constructor(ledAmount: Min<1>,withComments : boolean, preprocessingCode: string, ledPin: PositiveNumber, selectedPreview: string){
        this.withComments = withComments;
        this.ledAmount = ledAmount;
        this.preprocessingCode = preprocessingCode;
        this.ledPin = ledPin;
        this.selectedPreview = selectedPreview;
    }

    // Serializes the environment. This serialized object can the be deserialized by the deserialize function
    static serialize(env: Environment): OpenObject{
        return {...env};
    }

    /**
     * Deserializes the given object to an environment
     * 
     * @throws {SystemError} if any value is invalid
     */
    static deserialize(obj: OpenObject){
        if(typeof obj.withComments !== "boolean")
            throw new SystemError("withComments must be a boolean");

        if(typeof obj.preprocessingCode !== "string")
            throw new SystemError("preprocessingCode must be a string");

        if(!isInteger(obj.ledPin) || !isMin(obj.ledPin,0))
            throw new SystemError("ledPin must be a positive integer");

        if(!isInteger(obj.ledAmount) || !isMin(obj.ledAmount,1))
            throw new SystemError("ledAmount must be an integer >= 1");

        if(typeof obj.selectedPreview !== "string" || !PREVIEWS.includes(obj.selectedPreview))
            throw new SystemError("selectedPreview must be an the index of a preview");

        return new Environment(obj.ledAmount, obj.withComments, obj.preprocessingCode, obj.ledPin, obj.selectedPreview);
    }

}