// https://stackoverflow.com/a/52171480
/**
 * Typescript-modified version of https://stackoverflow.com/a/52171480
 * 
 * Function to generate a unique hash of 53 byte.
 * @param str the string to hash
 * @param seed an optional seed to generate different alterations of a single string
 * @returns the hash
 */
export function hash53b(str: string, seed: number = 0) : number {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

/**
 * Implementation of the rot-13 algorithm
 * 
 * Works only for alphabetic characters
 * @param str the string to rotate
 */
export function rot13(str: string){
    const [a, z, A, Z] = 'azAZ'.split("").map(x=>x.charCodeAt(0));

    return str.split("").map(x=>{
        // Gets char to transform
        var original = x.charCodeAt(0);
        
        // Gets if it's upper or lower
        var isUpper = original >= A && original <= Z;
        var isLower = original >= a && original <= z;

        // If it's a non-alphabetic char, just skip
        if(!isUpper && !isLower)
            return x;

        // Calculates the next char
        var next = original+13;
    
        // Performs round transformation
        if((isLower && next > z) || (isUpper && next > Z))
            next-=26;
    
        return String.fromCharCode(next);
    }).join("")
}