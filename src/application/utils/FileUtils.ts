
// Takes in a string and returns the same string as a valid file-name.
// It replaces all invalid characters with an underscore
export function makeValidFilename(baseName: string) : string{
    return (baseName as any).replaceAll(/[^\w ()-_.$!\d]/gi, "_");
}