// Handles errors that are not runtime-based by because of some programmer-error
export function handleProgrammingError<X>(err: string){
    alert("We have detected a programming-error. Please report the following to the developer: "+err);
    
    // Throws the error
    throw null;
    return null as any as X;
}