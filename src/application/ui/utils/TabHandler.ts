import { SystemError } from "../../errorSystem/Errors.js";
import { S, SM } from "./UiUtils.js";

/**
 * The TabHandler removes/adds element to the page depending on the current tab.
 * It takes in an array of tab-buttons which all have to have an attribute called "tab" that contains their tab-id.
 * These will be modified with a click-event and design-changes depending on their tab's selection state.
 * 
 * Also this takes in an array of tab-elements. These must have the same parent which they will be removed from and readded to when their tab get's selected.
 * 
 * The selectedTab is the numeric-id of the first selected tab.
 * 
 * The onTabSelect function is an optional event handler that will fire whenever a new tab get's selected.
 * This can eigther return a different tab-id that shall be selected or a false (Indicating that the event shall be cancled).
 * If nothing is defined for this function, or the function returned nothing, everything works as normal
 */
export class TabHandler{

    // Id of the current tab
    private selectedTab: number;

    // Array with all tabs (Element and their tab-id)
    private tabs: [HTMLElement, number][] = [];

    // Tab-button elements (Element and their tab-id)
    private buttons: [HTMLElement, number][] = [];

    // Wrapper where the tabs will be added to
    private tabParent: HTMLElement;

    // (Optional) Event handler for the tab-change event
    private onTabSelect?: (tabId: number)=>boolean|number|void;

    constructor(tabWrapper: HTMLElement, tabButtons: [HTMLElement, number][], tabs: [HTMLElement, number][], selectedTab: number){
        this.selectedTab = selectedTab;

        // Registers the tabs
        this.tabParent = this.registerTabs(tabs);

        // Registers the buttons
        this.registerButtons(tabButtons);

        // Registers the resize-handler for chaning from text to icons
        this.registerResizehandler(S(".th-picker",tabWrapper));

        // Updates the ui with the currently selected tab
        this.update();
    }

    // Sets the tab-change event handler
    public setTabChangeHandler(onTabSelect?: (tabId: number)=>boolean|number|void){
        this.onTabSelect = onTabSelect;
    }

    // Selects a different tab. Ensure that the tab exists, if no tab is selected, the field for the
    // tab will be empty and no button will be highlighted
    public selectTab(id: number){
        // Ensures that that id isn't already selected
        if(id === this.selectedTab)
            return;

        // Executes the event-handler if given
        if(this.onTabSelect !== undefined){
            let res = this.onTabSelect(id);

            // Checks for a cancle
            if(res === false)
                return;

            // Checks for an update
            if(typeof res === "number")
                id = res;
        }

        // Updates the tab and the ui
        this.selectedTab = id;
        this.update();
    }

    public getSelectedTab(){
        return this.selectedTab;
    }

    // Updates the ui. Call this when a change occurres with the tab-selection
    private update(){
        // Updates the tabs
        for(let [tab, tabId] of this.tabs){            
            // Removes/Adds depending on the current selection
            tab.parentElement?.removeChild(tab);

            // Checks if the tab must be appended
            if(this.selectedTab === tabId)
                this.tabParent.appendChild(tab);
        }

        // Updates the buttons
        for(let [btn, tabId] of this.buttons){            
            // Adds/Removes the selected class depending on if the button's tab is selected
            if(tabId === this.selectedTab)
                btn.classList.add("th-select");
            else
                btn.classList.remove("th-select");
        }
    }

    // Appends the event-handler to the tab-buttons and saves the button globally
    private registerButtons(rawButtons: [HTMLElement, number][]){
        // Saves the buttons globally
        this.buttons = rawButtons;

        // Iterates over every button
        for(let [btn,tabId] of rawButtons)
            // Appends the event-handler
            btn.addEventListener("click",()=>this.selectTab(tabId));
    }

    
    /**
     * 
     * Takes in an array of @param rawTabs and maps it into a loopup-table to save globally.
     * Unmounts the tabs from the document and returns the parent element that the tabs are mounted at. This is their entry point.
     * 
     * @throws {SystemError} if there is a critical error
     * @returns {HTMLElement} the parent element of all tabs
     */
    private registerTabs(rawTabs: [HTMLElement, number][]): HTMLElement{
        // Saves the tabs
        this.tabs = rawTabs;
        
        // Parent-reference
        var parent: HTMLElement|undefined;

        // Inits the tabs
        for(let [tab, _] of rawTabs){
            // Ensures that they are mounted
            if(tab.parentElement === undefined)
                throw new SystemError("Tab is not mounted on the document.");
            
            // Checks if the parent is currently unset
            if(parent !== undefined){
                // Checks if the parent match up
                if(parent !== tab.parentElement)
                    throw new SystemError("Two tabs don't share the same parents.");
            }else
                // Sets the mount point
                parent = tab.parentElement as HTMLElement;

            // Removes the element from the document
            tab.parentElement?.removeChild(tab);
        }

        // Ensures that at least one tab got registered
        if(parent === undefined)
            throw new SystemError("No tabs were registered");

        return parent;
    }

    private onResize(entrys: ResizeObserverEntry[]){
        // Iterates over all changes
        for (let entry of entrys) {
            // Gets the parent
            var parent = entry.target.parentElement as HTMLElement;

            // Checks if some texts have already been moved to the second line
            if(entry.contentRect.height > entry.target.children[0].clientHeight)
                parent.classList.add("th-hide");
            else
                parent.classList.remove("th-hide");
        }
    }

    private registerResizehandler(tabPicker: HTMLElement){
        // Creates the observer
        var res = new ResizeObserver(this.onResize.bind(this));

        // Registers the listener
        res.observe(S(".th-texts",tabPicker));
    }

}