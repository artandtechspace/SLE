import { S } from "../utils/UiUtils";

export class PopupSystem{
 
    // HTML-Elements from the system
    private overlay: HTMLElement;
    private contentHolder: HTMLElement;
    private closeBtn: HTMLInputElement;

    constructor(){
        // Gets the overlay, popup and close button
        this.overlay = S("#popup-overlay");
        this.contentHolder = S("#popup-content", this.overlay);
        this.closeBtn = S("#popup-close", this.overlay) as HTMLInputElement;

        // Appends the close event to the button
        this.closeBtn.addEventListener("click",this.closePopup);        
    }

    /**
     * Takes in a piece of html and shows it as a popup
     * @param content the content
     */
    public showPopup=(content: HTMLElement)=>{
        // Closes any previous popups
        this.closePopup();

        // Shows the overlay
        this.overlay.classList.add("shown");

        // Appends the content
        this.contentHolder.appendChild(content);
    }

    /**
     * Closes the popup if one is open
     */
    public closePopup=()=>{
        // Hides the overlay
        this.overlay.classList.remove("shown");

        // Unconnects all children from the popup
        while(this.contentHolder.children.length > 0)
            this.contentHolder.removeChild(this.contentHolder.children[0]);
    }

}