import { create } from "../../../utils/HTMLBuilder.js";
import { Element } from "./BaseElement.js";

export class LineSeperatorElement extends Element{
    // Percentage length of the line-seperator
    public readonly percentageLength: number;

    constructor(percentageLength: number){
        super();
        this.percentageLength = percentageLength;
    }

    render(): HTMLElement {
        return create("div",{
            cls: "bsg-line-seperator",
            attr: {"style": `width: ${this.percentageLength}%`}
        });
    }
}