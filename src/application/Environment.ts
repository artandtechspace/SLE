export class Environment{

    public withComments : boolean;
    public ledAmount : number;
    public preprocessingCode: string;
    public ledPin : number;

    public constructor(ledAmount: number,withComments : boolean, preprocessingCode: string, ledPin: number){
        this.withComments = withComments;
        this.ledAmount = ledAmount;
        this.preprocessingCode = preprocessingCode;
        this.ledPin = ledPin;
    }

}