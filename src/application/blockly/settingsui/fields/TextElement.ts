import { create } from "../../../utils/HTMLBuilder.js";
import { Element } from "./BaseElement.js";

export class TextElement extends Element{
    public readonly text: string;

    constructor(text: string){
        super();
        this.text=text;
    }

    render(): HTMLElement {
        return create("p",{
            text: this.text,
            cls: "bsg-text"
        });
    }
}