import { Language, LVarSet } from "../language/LanguageManager.js";
import { getParamInvalidNameErrorMessage } from "../parameterCalculator/ParameterCheck.js";
import { ErrorType } from "../parameterCalculator/system/internal/ParameterSystemModel.js";
import { UParameterModel } from "../parameterCalculator/system/internal/ParameterSystemTypes.js";
import { ExceptionBase } from "./ExceptionBase.js";

export abstract class Error extends ExceptionBase{}

export class BlockError extends Error{
    // Block that the error originated from
    public readonly block: any;

    constructor(message: string, block: any){
        super(message);
        this.block = block;
    }
}

export class LoadingError extends Error{
    public constructor(langKey: string, langVars?: LVarSet){
        super(Language.get(langKey, langVars));
    }
}

export class DesyncedWorkspaceError extends Error{
    /**
     * @param langKey the reference inside the language-file 
     */
    public constructor(langKey: string){
        super(Language.get(langKey));
    }
}

// Used when an Environment get's deserialized
export class EnvDeserialisationError extends Error{
    public constructor(langKey: string){
        super(Language.get(langKey));
    }
}

export class InvalidValueError extends Error{
    public constructor(message: string){
        super(message);
    }
}

export class CalculationError extends Error{
    public readonly details?: any;

    public constructor(message: string, details?: any){
        super(message);
        this.details = details;
    }
}

export class LanguageLoadingError extends Error {
    public constructor(message: string){
        super(message);
    }
}

export class ParameterError extends Error {

    // Takes in an error-type and a paramter that the error applies to and return the required error
    public static of(type: ErrorType, prm: UParameterModel) : ParameterError{
        switch(type){
            case ErrorType.INVALID_NAME:
                return new ParameterError(...getParamInvalidNameErrorMessage(prm.name));
            case ErrorType.DUPLICATED_NAME:
                return new ParameterError(
                    "ui.parameter.errors.name.duplicated",
                    prm.name
                )
            case ErrorType.INVALID_VALUE:
                return new ParameterError(
                    "ui.parameter.errors.value.invalid",
                    prm.name
                );
        }
    }

    /**
     * @param langKey key passed to the language-lookup
     * @param langVars language-variables passed to the language-lookup
     */
    private constructor(langKey: string, langVars?: LVarSet){
        super(Language.get(langKey, langVars));
    }
}