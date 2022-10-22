import { getApi } from "../apiWrapper/APIWrapper";

// Handles errors that are not runtime-based by because of some programmer-error
export function handleProgrammingError<X>(err: string){
    console.log(err);
    getApi().showErrorMessage("Programming-error", "We have detected a programming-error.\n Please report the following to the developer:\n"+err);
    
    // Throws the error
    throw null;
    return null as any as X;
}