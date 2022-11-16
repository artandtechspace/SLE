import { Language } from "../../language/LanguageManager";
import { isBooleanEV } from "../../utils/ElementValidation";
import { create as C } from "../../utils/HTMLBuilder";
import { EntryBase, isClickEntry, isDividerEntry, isSubmenuEntry, MenuBase } from "./MenubarSystem";

// Performs a language-lookup for the menubar-items
const resolveLang=(base: string)=>Language.get("ui.menubar."+base);

// Converts a single menu-entry to html
function convertEntryToHTMl(entry: EntryBase, langbase: string) : HTMLLIElement|undefined {
    // Checks for a submenu-entry
    if(isSubmenuEntry(entry)){

        // Creates the submenu and recuresively refers to this function for the other subelements
        return C("li", {
            cls: "submenu",
            chld: [
                C("span", {text: resolveLang(langbase+entry.name)}),
                C("ul", {
                    chld: convertEntrysToHTML(entry.subelements,langbase+".")
                })
            ]
        }) as HTMLLIElement;
    }

    // Checks for a click-entry
    if(isClickEntry(entry)){
        // Gets if the entry is enabled
        var isEnabled = isBooleanEV(entry.enabled) ? entry.enabled : true;

        // Creates the click-entry
        return C("li", {
            cls: isEnabled ? "" : "disabled",
            text: resolveLang(langbase+entry.name),
            evts: { "click": isEnabled ? entry.action : undefined }
        }) as HTMLLIElement;
    }

    // Checks for a divider entry
    if(isDividerEntry(entry)){
        // Creates the divider-entry
        return C("li", {cls: "divider"}) as HTMLLIElement;
    }

    // This should not happen as an invalid element got registered
    // Notifies via console-error
    console.error("Menubar-error: Could not parse element: "+JSON.stringify(entry));

    // Doesn't return anything to not disturb the menu
}

// Converts an array of menu-entrys to html
// Langbase is with trailing dots if required
function convertEntrysToHTML(entrys: EntryBase[],langbase: string = "") : HTMLLIElement[]{
    return entrys.map(x=>convertEntryToHTMl(x, langbase)).filter(x=>x!==undefined) as HTMLLIElement[];
}

// Converts the menu-base to html
export function convertMenuToHTML(menu: MenuBase) : HTMLElement[] {
    
    // List with all html-submenu elements
    var elements : HTMLElement[] = [];

    // Iterates over every submenu
    for(var key in menu){
        var entrys = menu[key];

        // Creates the html-representation for the submenu
        elements.push(C("div", { attr: {"tabindex": "0"}, chld: [
            C("span", { text: resolveLang(key) }),
            C("ul", { chld: convertEntrysToHTML(entrys, key+".")})
        ]}));
    }

    return elements;
}