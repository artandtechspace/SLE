import { ExceptionBase } from "./ExceptionBase.js";

export abstract class Error extends ExceptionBase{}

export class SystemError extends Error{
    public constructor(message: string){
        super(message);
    }
}

export class BlockError extends Error{
    // Block that the error originated from
    public readonly block: any;

    constructor(message: string, block: any){
        super(message);
        this.block = block;
    }
}