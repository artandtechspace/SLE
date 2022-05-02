export interface ModuleReturn{

    // If not returned, unused
    setup?: string

    // If not returned, unused
    loop?: string,

    // If not returned is false
    isDirty?: boolean
}