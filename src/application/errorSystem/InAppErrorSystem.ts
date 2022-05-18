import { S } from "../ui/utils/UiUtils.js";
import { BlockError, Error } from "./Errors.js";
import { BlockWarning, Warning } from "./Warnings.js";
import { ExceptionBase } from "./ExceptionBase.js";

/*
 * Minor-error-handling system for inapp errors (After inital initalisation/setup)
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
        this.clearScreen();
    }

    // Removes any error from the info 
    public clearScreen(){
        // Hides the button and removes it's listener
        this.button.classList.add("hidden");
        (this.button as any).onclick = undefined;
        
        // Removes any error messages
        this.display.textContent="";
        this.display.setAttribute("class","");
    }

    // Shows the exception on the bottom of the screen
    public show(exception: ExceptionBase){
        this.clearScreen();

        // Checks the type
        
        if(exception instanceof Warning){
            this.writeWarning(exception);
            return;
        }

        if(exception instanceof Error)
            this.writeError(exception as Error);
    }

    // Inserts the warning at the bottom of the screen
    private writeWarning(warning: Warning){
        this.clearScreen();

        // Makes the error visible via yellow text
        this.display.classList.add("warn");

        // Checks if the error is a block-error
        if(warning instanceof BlockWarning){
            // Shows the button and adds the listener
            this.button.classList.remove("hidden");
            this.button.onclick = (_)=>{
                try{
                    warning.block.select();
                }catch(_){}
            };
        }

        // Displays the error message
        this.display.textContent = warning.message;
    }

    // Inserts the error at the bottom of the screen
    private writeError(error: Error){
        this.clearScreen();

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