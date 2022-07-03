
// System-Parameter with name and internal getter to dynamically update the value whenever rendered 
export type SysParameterModel = {
    // Unique name of the parameter
    name: string,

    // Internal getter for the value
    getter: ()=>number
}

export type SysParameterView = {
    // Unique name of the parameter
    name: string,

    // Input for the value (Display only)
    valueInput: HTMLInputElement
}

// User-Parameter with name, value and some other properties
export type UParameterModel = {
    // Numeric value of the parameter (Can be NAN if an valid value has been set)
    value: number,

    // This name can be duplicated over multiple parameters but that will be displayed as an error to the user
    name: string,

    // Unique id only for the current program-instance (Not relevant when saving or loading).
    // This is just required to be unique for the program.
    instanceId: number
}

// View-elements of a user-parameter
export type UParameterView = {
    nameInput: HTMLInputElement,
    valueInput: HTMLInputElement,
    body: HTMLElement,

    // Again the unique id of a uparameter-instance
    instanceId: number
}

export type ParameterModel = UParameterModel|SysParameterModel;

// Typescript-function to check if a parameter-model is eigther for a system-parameter or a user-parameter
export function isSystemParameter(param: ParameterModel) : param is SysParameterModel{
    return (param as any).getter !== undefined;
}
