import { SliderBar, SliderBarDirection } from "./utils/SliderBar.js";
import { TabHandler } from "./utils/TabHandler.js";

// Shorts select function
const S: (name:string) => HTMLElement = document.querySelector.bind(document);

// Executes to setup the ui
// Returns an object with all important elements
export function setupUi(){
    registerSliderBars();
    registerSidebarIconChanger();
    var tabhandler = registerSidebarTabs();

    return {
        tabhandler
    };
}

// Registers the sidebar-tabs and logic
function registerSidebarTabs(){

    // Gets the general tab-buttons
    const TAB_BUTTONS: HTMLElement[] = [
        ...S("#texts").children as unknown as HTMLElement[],
        ...S("#icons").children as unknown as HTMLElement[]
    ];

    return new TabHandler(TAB_BUTTONS,document.querySelectorAll(".tab") as unknown as HTMLElement[],1);
}


// Registers the sliders
function registerSliderBars(){
    SliderBar.register(S("#controls"), S(".sliderbar.y"), 80, 500, SliderBarDirection.DIRECTION_Y_BACKWARD);
    SliderBar.register(S("#sidebar"),S(".sliderbar.x"), 50, 500, SliderBarDirection.DIRECTION_X_BACKWARD);
}



// Registers the resize listener that handle the change from text to icons for the sidebar when it get's to small
function registerSidebarIconChanger(){

    // Creates the observer
    var res = new ResizeObserver(entries=>{

        // Iterates over all changes
        for (let entry of entries) {
            // Gets the parent
            var parent = entry.target.parentElement as HTMLElement;

            // Checks if some texts have already been moved to the second line
            if(entry.contentRect.height > entry.target.children[0].clientHeight)
                parent.classList.add("hide");
            else
                parent.classList.remove("hide");
        }
    });

    // Registers the listener
    res.observe(S("#texts"));
}