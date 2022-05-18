import { ExceptionBase } from "./ExceptionBase.js";

export abstract class Warning extends ExceptionBase{}

export class BlockWarning extends Warning{
    // Block that the warning originated from
    public readonly block: any;

    constructor(message: string, block: any){
        super(message);
        this.block = block;
    }
}