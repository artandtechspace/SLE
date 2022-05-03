export abstract class ExceptionBase{
    // Exception-message
    public readonly message: string;

    protected constructor(message: string){
        this.message = message;
    }
}
