import { Error } from "./Error";

class ErrorSystemCls{

    private button: HTMLElement;
    private display: HTMLElement;

    constructor(){
        // Gets the error-elements
        var bar = document.querySelector("#infobar") as HTMLElement;

        // Gets the button and display
        this.display = bar.querySelector("span") as HTMLElement;
        this.button = bar.querySelector("i") as HTMLElement;

        // Removes and errors by default
        this.removeError();
    }

    // Removes any error from the info 
    public removeError(){
        // Hides the button
        this.button.classList.add("hidden");
        
        // Removes and error messages
        this.display.textContent="";
    }

    // Inserts the error at the bottom of the screen
    public writeError(error: Error){
        // Makes the error visible via red text
        this.display.classList.add("error");

        // Displays the error message
    }

}

export const ErrorSystem = new ErrorSystemCls();