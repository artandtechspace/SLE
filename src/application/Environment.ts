export class Environment{

    public readonly withComments : boolean;
    public readonly ledAmount : number;
    public readonly preprocessingCode: string;
    public readonly ledPin : number;

    public constructor(ledAmount: number,withComments : boolean, preprocessingCode: string, ledPin: number){
        this.withComments = withComments;
        this.ledAmount = ledAmount;
        this.preprocessingCode = preprocessingCode;
        this.ledPin = ledPin;
    }

}