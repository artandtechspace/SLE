import { getApi } from "../../apiWrapper/APIWrapper";
import { MenuBase } from "./MenubarSystem";

export function createMenu() : MenuBase {
    return {
    
        "file": [
            {
                name: "open",
                action(){
                    console.log("Open");
                }
            },
            "divider",
            {
                name: "save",
                action(){
                    console.log("Triggert save");
                    
                }
            },
            {
                name: "save-as",
                action(){
                    console.log("Triggert save-as");
                }
            },
            "divider",
            {
                name: "close",
                action: getApi().closeElectronWindow,
                enabled: getApi().isElectron()
            }
        ],
        "extra": [
            {
                name: "webpage",
                action: ()=> getApi().openURL("https://artandtech.space/")
            },
            {
                name: "report-issue",
                action: ()=> getApi().openURL("https://github.com/artandtechspace/SLE/issues")
            },
            "divider",
            {
                name: "dev-tools",
                enabled: getApi().isElectron(),
                action: getApi().openElectronDevTools
            }
        ]
    }
}