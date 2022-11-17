import { EnvDeserialisationError } from "./errorSystem/Errors";
import { Language } from "./language/LanguageManager";
import { isMin, Min, OpenObject, PositiveNumber } from "./types/Types";
import { PREVIEWS } from "./ui/utils/UiEnvironmentIntegration";
import { isBooleanEV, isIntegerEV, isStringEV } from "./utils/ElementValidation";

export class Environment{

    // (Optional) path where the file is saved
    public savePath?: string;

    // Project-name
    public projectName: string;

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

    public constructor(savePath: string|undefined,projectName: string, ledAmount: Min<1>,withComments : boolean, preprocessingCode: string, ledPin: PositiveNumber, selectedPreview: string){
        this.withComments = withComments;
        this.ledAmount = ledAmount;
        this.preprocessingCode = preprocessingCode;
        this.ledPin = ledPin;
        this.selectedPreview = selectedPreview;
        this.projectName = projectName;
        this.savePath = savePath;
    }

    // Serializes the environment. This serialized object can the be deserialized by the deserialize function
    static serialize(env: Environment): OpenObject{
        return {
            withComments: env.withComments,
            ledAmount: env.ledAmount,
            preprocessingCode: env.preprocessingCode,
            ledPin: env.ledPin,
            selectedPreview: env.selectedPreview,
            projectName: env.projectName,
        };
    }

    /**
     * Deserializes the given object to an environment
     * 
     * @throws {SerialisationError} if any value is invalid
     */
    static deserialize(obj: OpenObject, savePath: string|undefined){
        if(!isBooleanEV(obj.withComments))
            throw new EnvDeserialisationError("import.error.general.withcomments");

        if(!isStringEV(obj.preprocessingCode))
            throw new EnvDeserialisationError("import.error.general.preproccode");

        if(!isIntegerEV(obj.ledPin) || !isMin(obj.ledPin,0))
            throw new EnvDeserialisationError("import.error.general.ledpin");

        if(!isIntegerEV(obj.ledAmount) || !isMin(obj.ledAmount,1))
            throw new EnvDeserialisationError("import.error.general.ledamount");

        if(!isStringEV(obj.selectedPreview) || !PREVIEWS.includes(obj.selectedPreview))
            throw new EnvDeserialisationError("import.error.general.selectedpreview");

        if(!isStringEV(obj.projectName))
            obj.projectName = Language.get("ui.header.project.defaultname");

        return new Environment(savePath, obj.projectName, obj.ledAmount, obj.withComments, obj.preprocessingCode, obj.ledPin, obj.selectedPreview);
    }

}