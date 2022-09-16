import { create } from "../../utils/HTMLBuilder";

// Event-handler for the input-event on the sizeable-textfield
function onWrite(evt: any){
    evt.target.parentElement.children[0].textContent = evt.target.value;
}

/**
 * Takes in an input-element and makes it size-able by just writing inside it.
 * @param input the html-input
 * @returns the new html-element to append to the document
 */
export function createSizeableTF(input: HTMLInputElement){
    // Appends the write-event
    input.addEventListener("input", onWrite);

    return create("div",{
        chld: [
            // Decoy element for sizing the input element like it's input text
            create("p", { cls: "decoy", text: input.value }),
            // Input
            input
        ],
        cls: "sizeableTF"
    });
}