import { create } from "../../../utils/HTMLBuilder.js";
import { Element } from "./BaseElement.js";

export class LineSeperatorElement extends Element{

    constructor(){
        super();
    }

    render(): HTMLElement {
        return create("div",{
            cls: "bsg-line-seperator"
        });
    }
}