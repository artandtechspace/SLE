export class Config{

    // The raw config-object
    private readonly rawObject: object;

    constructor(object: object){
        this.rawObject = object;
    }

    /**
     * Tries to get a value from the config. If it failes to get one it will fall back to the default value or null if not given.
     * 
     * @param key key for the config.
     * @param defaultValue the default value for when no value is provided. At default is not required to be set.
     * @param typeName optionally can specify a string for a type which will be checked with typeof.
     * @returns the value or the default if failed to be correct.
     */
    get(key: string, defaultValue: any = null, typeName = undefined) : any{
        // Gets the value
        var value : any = key as keyof typeof this.rawObject;

        // Checks if the value is not given
        if(value === undefined || value === null)
            return defaultValue;

        // Checks if either the type is not required or the type matches
        if(typeName !== undefined && typeof value !== typeName)
            return null;
        
        return value;
    }

}