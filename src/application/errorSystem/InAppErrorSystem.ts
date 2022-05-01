import { S } from "../ui/utils/UiUtils.js";
import { BlockError, Error } from "./Error.js";

/*
 * Minor-error-handling system for inapp errors (After inital initalisation) 
 */

export class InAppErrorSystem{

    // HTML-Elements
    private button: HTMLElement;
    private display: HTMLElement;

    constructor(){
        // Gets the error-elements
        var bar = S("#infobar");

        // Gets the button and display
        this.display = S("span",bar);
        this.button = S("i",bar);

        // Removes all errors by default
        this.removeError();
    }

    // Removes any error from the info 
    public removeError(){
        // Hides the button and removes it's listener
        this.button.classList.add("hidden");
        (this.button as any).onclick = undefined;
        
        // Removes any error messages
        this.display.textContent="";
    }

    // Inserts the error at the bottom of the screen
    public writeError(error: Error){
        // Makes the error visible via red text
        this.display.classList.add("error");

        // Checks if the error is a block-error
        if(error instanceof BlockError){
            // Shows the button and adds the listener
            this.button.classList.remove("hidden");
            this.button.onclick = (_)=>{
                try{
                    error.block.select();
                }catch(_){}
            };
        }

        // Displays the error message
        this.display.textContent = error.message;
    }

}