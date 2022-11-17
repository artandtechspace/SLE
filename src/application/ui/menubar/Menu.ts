import { getApi } from "../../apiWrapper/APIWrapper";
import { MenuBase } from "./MenubarSystem";

export function createMenu() : MenuBase {
    return {
    
        "file": [
            {
                name: "open",
                action: getApi().importProject
            },
            "divider",
            {
                name: "save",
                enabled: getApi().isElectron(),
                action: ()=>getApi().exportProject(false)
            },
            {
                name: "save-as",
                action: ()=>getApi().exportProject(true)
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