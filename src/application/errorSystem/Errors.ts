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
    public constructor(message: string){
        super(message);
    }
}

export class DesyncedWorkspaceError extends Error{
    public constructor(message: string){
        super(message);
    }
}

export class SerialisationError extends Error{
    public constructor(message: string){
        super(message);
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