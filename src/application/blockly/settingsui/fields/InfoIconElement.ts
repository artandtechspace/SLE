import { Language } from "../../../language/LanguageManager.js";
import { create } from "../../../utils/HTMLBuilder.js";
import { Element } from "./BaseElement.js";

export class InfoIconElement extends Element{
    public readonly text: string;

    constructor(langKey: string) {
        super();
        this.text=Language.get(langKey);
    }

    render(block: any): HTMLElement {
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