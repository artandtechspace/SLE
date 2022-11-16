import { isArrayEV, isObjectEV } from "../../utils/ElementValidation";

// Simple entry with an onclick-action
type ClickEntry = {
    name: string,
    action: ()=>void,
    enabled?: boolean // Default is true
}

// Divder between entrys and therefor sections
type DividerEntry = "divider";

// Collection of other entrys
type SubmenuEntry = {
    name: string,
    subelements: EntryBase[]
};

// Can be every type of entry
export type EntryBase = DividerEntry|ClickEntry|SubmenuEntry;


export type MenuBase = {
    [key: string]: EntryBase[]
}

// Checks for entry types
export const isClickEntry=(element: EntryBase) : element is ClickEntry => isObjectEV(element);
export const isDividerEntry = (element: EntryBase) : element is DividerEntry => element === "divider";
export const isSubmenuEntry=(element: EntryBase) : element is SubmenuEntry => isObjectEV(element) && isArrayEV((element as any).subelements);
