export abstract class Element{
    // Generates a single html-element to represent the submenu-element
    abstract render() : HTMLElement;

    // Event that executes when the outer menu actually gets finished
    init(changeCB: ()=>void) {}
}

export abstract class SupplierElement<T> extends Element{
    // Current value of the supplier-element
    private currentValue: T;

    // Inital value of the element
    public readonly initValue: T;

    // Key-name of the element (Used to get the value)
    public readonly key: string;

    // Callback-handler to call when the value has changed
    // This will be set correctly once when the outer menu get's build
    private changeCB: ()=>void = null as any as ()=>void;

    constructor(key: string, initValue: T){
        super();
        this.initValue = this.currentValue = initValue;
        this.key = key;
    }

    init(changeCB: ()=>void): void {
        this.changeCB = changeCB;
    }

    // Returns the current value of the ui-element
    getValue() : T {
        return this.currentValue;
    }

    // Sets the value of the ui-element
    setValue(value: T){
        this.currentValue = value;
        this.changeCB();
    }

    /**
     * Trys to load a previously serialized value back into the field. This should however be considered an outside value and therefor must be validated.
     * @param raw the raw value to load
     * @returns {boolean} if the load was successful
     */
    abstract deserialize(raw: string) : boolean;

    // Serializes the current value to a string
    abstract serialize() : string;
}