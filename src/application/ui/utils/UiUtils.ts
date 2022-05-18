

import { SystemError } from "../../errorSystem/Errors.js";

// Short name for the queryselector-function
// Also throws a SystemError if the element couldn't be found
export function S(name: string, base: HTMLElement = document.body): HTMLElement{
    // Querys the element
    var x = base.querySelector(name);

    // Ensures that the element got found
    if(x === null)
        throw new SystemError("Object: "+name+" couldn't be found!");

    return x as HTMLElement;
}

// Sort name for the queryselector-all (multiple) function
// Also throws a SystemError if the element couldn't be found
export function SM(name: string, base: HTMLElement = document.body): NodeListOf<HTMLElement>{
    // Querys the element
    var x = base.querySelectorAll(name);

    // Ensures that the element got found
    if(x === null)
        throw new SystemError("Object: "+name+" couldn't be found!");

    return x as NodeListOf<HTMLElement>;
}