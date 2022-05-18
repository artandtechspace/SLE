
/**
 * When calling the toString method (eg. when using string-interpolation) this will just return the plain old variable-name.
 * That means that the following call:
 * 
 * var va = new Variable(...);
 * var code = `
 *    ${va}++;
 *    print(${va})
 * `
 * 
 * would work perfectly fine.
 */
 export class Variable {
    public readonly name: string;
    public readonly type: string;
    public readonly initValue: string;

    constructor(name: string, type: string, initValue: string) {
        this.name = name;
        this.type = type;
        this.initValue = initValue;
    }

    /**
     * @returns statement to declair the variable. Also directly has the semicolon at the end.
     */
    declair(){
        return this.type+" "+this.assign();
    }

    /**
     * @returns statement to (re)assignes the variable. Also directly has the semicolon at the end.
     */
    assign(){
        return this.name+(this.initValue !== undefined ? ` = ${this.initValue};` : ";" ) 
    }

    toString(){
        return this.name;
    }
}