export class Error{
    // Error-message
    public readonly message: string;

    protected constructor(message: string){
        this.message = message;
    }
}

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