import { create } from "../../../utils/HTMLBuilder.js";
import { Element } from "./BaseElement.js";

export class ForceLineBreakElement extends Element{

    constructor(){
        super();
    }

    render(): HTMLElement {
        return create("br");
    }
}