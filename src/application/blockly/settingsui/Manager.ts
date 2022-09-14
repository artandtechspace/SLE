import { SettingsUI } from "./SettingsUI.js";

export class SettingsUIManager{

    // Reference to the submenu on the ui
    private blocklySubmenu: HTMLDivElement = null as any as HTMLDivElement;

    // Callback when any element performs a critical change
    private onChangeCallback: ()=>void = null as any as ()=>void;

    /**
     * Takes in the @param blocklySubmenu as the menu-element to perform operations on and
     * the @param onChangeCallback as the change-callback.
     * 
     * This function must be called before anything else inside this class
     */
    public attachToUI(blocklySubmenu: HTMLDivElement, onChangeCallback: ()=>void){
        this.blocklySubmenu = blocklySubmenu;
        this.onChangeCallback = onChangeCallback;
    }

    // Event: Fires when a blockly-block get's selected or unselected
    public onBlockSelect(block: any|null){
        // Opens the submenu if this is a select (!= null) and the submenu is given
        if(block?.settingsui !== undefined)
            this.openUi(block);
        else
            this.hideUi();
    }

    // Opens the ui with the given block. Be sure that the given block does have a submenu
    public openUi(block: any){
        // Removes any previous stuff
        this.hideUi();
        // Removes the hidden class
        this.blocklySubmenu.classList.remove("hidden");
        // Appends the submenu-settings
        this.blocklySubmenu.append(...(block.settingsui as SettingsUI).render(block));
}

    // Hides the ui from screen
    public hideUi(){
        // Appends the hidden class
        this.blocklySubmenu.classList.add("hidden");
        // Removes any children-content
        this.blocklySubmenu.innerHTML="";
    }


    public getChangeCallback(){
        return this.onChangeCallback;
    }
}
