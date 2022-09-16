import { create } from "../../../utils/HTMLBuilder";
import { Element } from "./BaseElement";

export class LineSeperatorElement extends Element{
    // Percentage length of the line-seperator
    public readonly percentageLength: number;

    constructor(percentageLength: number){
        super();
        this.percentageLength = percentageLength;
    }

    render(block: any): HTMLElement {
        return create("div",{
            cls: "bsg-line-seperator",
            attr: {"style": `width: ${this.percentageLength}%`}
        });
    }
}