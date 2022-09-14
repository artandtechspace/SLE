export abstract class Element{
    // Generates a single html-element to represent the submenu-element
    abstract render(block: any) : HTMLElement;

    // Event that executes when the outer menu actually gets finished
    init(block: any, changeCB: ()=>void) {};
}

export abstract class SupplierElement<Storage, Giveback> extends Element{
    // Inital value of the element
    public readonly initValue: Storage;

    // Key-name of the element (Used to get the value)
    public readonly key: string;

    // Callback-handler to call when the value has changed
    // This will be set correctly once when the outer menu get's build
    private changeCB: ()=>void = null as any as ()=>void;

    constructor(key: string, initValue: Storage){
        super();
        this.initValue = initValue;
        this.key = key;
    }

    init(block: any, changeCB: ()=>void): void {
        block.uidata[this.key] = this.initValue;
        this.changeCB = changeCB;
    }
    
    /**
     * Takes the set value, parses the giveback-value and validates it.
     * 
     * Difference t othe serialize-function:
     * - This is used when getting the value from the blockly-blocks
     * - the serialize-function is used when loading and saving to a file/json-blob
     * 
     * @throws {LanguageRef} optional error if the parsing results in an error
     * @returns the parsed value
     */
    abstract validateParseAndGetValue(block: any): Giveback;

    // Returns the current value of the ui-element
    protected getValue(block: any) : Storage {
        return block.uidata[this.key];
    }

    // Sets the value of the ui-element
    protected setValue(block: any, value: Storage){
        block.uidata[this.key] = value;
        this.changeCB();
    }

    /**
     * Trys to load a previously serialized value back into the field. This should however be considered an outside value and therefor must be validated.
     * @param raw the raw value to load
     * @returns {boolean} if the load was successful
     */
    abstract deserialize(block: any, raw: any) : boolean;

    // Serializes the current value to something that can be reloaded by the deserialize function
    abstract serialize(block: any) : any;
}

export abstract class ElementBuilderBase<Base>{
    // Base to return the chain-method back to when the user pushes the final modification
    private readonly base: Base;

    constructor(base: Base){
        this.base = base;
    }

    // Pushes the build Element
    public andThen(){
        return this.base;
    }

    // Builds the final required element (This should not be used by the user, only by the system to assemble the elements)
    public abstract __getBuild() : Element;

}