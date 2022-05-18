
// Short name for the queryselector-function

import { SystemError } from "../../errorSystem/Errors.js";

// Also throws a SystemError if the element couldn't be found
export function S(name: string, base: HTMLElement = document.body): HTMLElement{
    // Querys the element
    var x = base.querySelector(name);

    // Ensures that the element got found
    if(x === null)
        throw new SystemError("Object: "+name+" couldn't be found!");

    return x as HTMLElement;
}