import { create } from "../../../utils/HTMLBuilder.js";
import { Element } from "./BaseElement.js";

export class InfoIconElement extends Element{
    public readonly text: string;

    constructor(text: string) {
        super();
        this.text=text;
    }

    render(): HTMLElement {
        return create("i",{
            cls: "infoIcon fa fa-info",
            attr: {"aria-hidden": "true"},
            chld:[
                create("div",{
                    cls: "popup",
                    chld:[
                        create("p", { text: this.text })
                    ]
                })
            ]
        });
    }
}