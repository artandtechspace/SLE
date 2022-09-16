import { Language, LVarSet } from "../language/LanguageManager";
import { ExceptionBase } from "./ExceptionBase";

export abstract class Warning extends ExceptionBase{}

export class BlockWarning extends Warning{
    // Block that the warning originated from
    public readonly block: any;

    constructor(block: any, langKey: string, vars?: LVarSet){
        super(Language.get(langKey, vars));
        this.block = block;
    }
}