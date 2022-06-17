import { SerialisationError } from "./errorSystem/Errors.js";
import { isMin, Min, OpenObject, PositiveNumber } from "./types/Types.js";
import { PREVIEWS } from "./ui/utils/UiEnvironmentIntegration.js";

export class Environment{

    // If comments should be added to the code
    public withComments : boolean;
    // How many leds are on the stripe that is required
    public ledAmount : Min<1>;
    // Code where the program-generated code is injected into
    public preprocessingCode: string;
    // Led-pin on the digispark
    public ledPin : PositiveNumber;
    // Name of the svg-file that is selected as the preview
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
     * @throws {SerialisationError} if any value is invalid
     */
    static deserialize(obj: OpenObject){
        if(typeof obj.withComments !== "boolean")
            throw new SerialisationError("withComments must be a boolean");

        if(typeof obj.preprocessingCode !== "string")
            throw new SerialisationError("preprocessingCode must be a string");

        if(!Number.isInteger(obj.ledPin) || !isMin(obj.ledPin,0))
            throw new SerialisationError("ledPin must be a positive integer");

        if(!Number.isInteger(obj.ledAmount) || !isMin(obj.ledAmount,1))
            throw new SerialisationError("ledAmount must be an integer >= 1");

        if(typeof obj.selectedPreview !== "string" || !PREVIEWS.includes(obj.selectedPreview))
            throw new SerialisationError("selectedPreview must be an the index of a preview");

        return new Environment(obj.ledAmount, obj.withComments, obj.preprocessingCode, obj.ledPin, obj.selectedPreview);
    }

}