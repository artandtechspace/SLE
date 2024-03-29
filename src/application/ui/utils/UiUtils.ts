import { handleProgrammingError } from "../../errorSystem/ProgrammingErrorSystem";

// Short name for the queryselector-function
export function S(name: string, base: HTMLElement = document.body): HTMLElement{
    // Querys the element
    var x = base.querySelector(name);

    // Ensures that the element got found
    if(x === null)
        return handleProgrammingError("Object: "+name+" couldn't be found!");

    return x as HTMLElement;
}

// Sort name for the queryselector-all (multiple) function
export function SM(name: string, base: HTMLElement = document.body): NodeListOf<HTMLElement>{
    // Querys the element
    var x = base.querySelectorAll(name);

    // Ensures that the element got found
    if(x === null)
        return handleProgrammingError("Object: "+name+" couldn't be found!");

    return x as NodeListOf<HTMLElement>;
}

// Basically a classList.setClass replacement
export function setClass(element: HTMLElement, name: string, toggle: boolean){
    if(toggle)
        element.classList.add(name);
    else
        element.classList.remove(name);
}