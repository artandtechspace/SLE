export class Config {

    // The raw config-object
    private readonly rawObject: object;

    constructor(object: object) {
        this.rawObject = object;
    }

    /**
     * Gets the raw element from the config-object
     */
    getRaw(key: string){
        return this.rawObject[key as keyof typeof this.rawObject];
    }

    /**
     * Tries to get the requested value from the user config.
     * Using the validator that value will be checked and if it's invalid the error will be thrown.
     * @returns the validated value
     */
    getRequired(key: string, validator: (val: any) => boolean, error: string) {
        // Gets the value
        var value: any = this.rawObject[key as keyof typeof this.rawObject];

        // Checks if the value is not given
        if(value === undefined)
            throw "Attribute '"+key+"' is required but not given.";

        // Checks if the validator is okay with the value
        if (!validator(value))
            throw "Error validating '" + key + "': " + error;

        return value;
    }

    /**
     * Like the normal get but this must not be given and there can be a default-value for non-specified config values.
     */
    getOptional(key: string, validator: (val: any) => boolean, error: string, defaultVal: any = undefined){
        // Gets the value
        var value: any = this.rawObject[key as keyof typeof this.rawObject];

        // Checks if the validator is okay with the value or if the value is just not given
        if (value !== undefined && !validator(value))
            throw "Error validating '" + key + "': " + error;

        // Returns the value or the default value
        return value || defaultVal;
    }
}