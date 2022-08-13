import { LoadingError } from "../errorSystem/Errors.js";
import { handleProgrammingError } from "../errorSystem/ProgrammingErrorSystem.js";
import { SM } from "../ui/utils/UiUtils.js";
import { isObjectEV, isStringEV } from "../utils/ElementValidation.js";


// Regex to match variables inside the static html-page
const HTML_MATCHER_REGEX = /^[ \t]*\{\{[ \t]*[\w\-\._]+[ \t]*\}\}[ \t]*$/i;

// Regex used to filter the variable-name from the whole variable-string
const LANG_KEY_MATCH_REGEX = /[\w\-\._]+/i;

// Regex to validate the file-name of language files
const LANGUAGE_NAME_REGEX = /^\w{2}_\w{2}$/i;

// Types that are valid to be passed as a variable for lookups to the language file
export type LVarType = number|string|boolean;

// Named array of these variables
export type LVarTypeArray = {[key:string]: LVarType}

// Either a named list with language-variables or just a language-variables to be called "var" when passed to the language file
export type LVarSet = LVarTypeArray | LVarType;

// Holds the loaded language after one get's loaded
var loadedLanguage: {[key: string]: string};

/**
 * Tries to load a given language file.
 * 
 * @param name the name of the file (Without extension). Must comply with the naming schema.
 * @throws {LoadingError} if something goes wrong
 */
async function loadLanguage(name: string){
    // Ensures the loading-name is compliant with the loading schema
    if(!LANGUAGE_NAME_REGEX.test(name))
        throw new LoadingError("Failed to load language, requested language file name '"+name+"' does not comply with the file-nameing schema.");

    try{
    
        // Await the language file
        var langAsText = await (await fetch("resources/languages/"+name+".jsonc")).text();

        // Filters simple comments
        langAsText = langAsText.split("\n").filter(x=>!x.trimStart().startsWith("//")).join("\n");

        // Parses the json
        var langAsJson = JSON.parse(langAsText)

        // Ensures the file is valid
        if(!isObjectEV(langAsJson))
            throw "Requested language file doesn't contain a valid language-object.";

        // Ensures the file contains only an object with string values
        if(!Object.values(langAsJson).every(isStringEV))
            throw "Requested language file doesn't contain a valid language-object.";
        
        // Stores the loaded language
        loadedLanguage = langAsJson;
    }catch(e){
        throw new LoadingError("Failed to catch language-file '"+name+"': "+e);
    }
}

/**
 * Scanns the whole static html-page and replaced variables with the actuall language-code
 */
function cleanHTMLPage(){
    Array.from(SM("*")).forEach(checkElement);
}

// Takes in a single html-tag, checks it's properties and replaces them if a language-key is found
function checkElement(elm: any){
    function handle(text:string, onSet: (text: string)=>void){
        // Checks if the text is a language-text
        if(!HTML_MATCHER_REGEX.test(text || ""))
            return;

        // Gets the language-key
        var langKey = text.match(LANG_KEY_MATCH_REGEX)![0];

        // Applies the lanuage-element
        onSet(getFromLanguage(langKey));
    }

    // Checks tag-type
    switch(elm.tagName.toLowerCase()){
        case "input":

            // Checks input-type
            switch(elm.type){
                case "button":
                    handle(elm.value, (set: string)=>elm.value = set);
                    break;
                case "text": case "password":
                    handle(elm.placeholder, (set: string)=>elm.placeholder = set);
                    break;
            }
            // Inputs only work with buttons
            if(elm.type !== "button")
                return;

            break;
        case "textarea":
            handle(elm.placeholder, (set: string)=>elm.placeholder = set);
            break;
        
        default:
            handle(elm.textContent, (set: string)=>elm.textContent = set);
            break;
    }
}

/**
 * Setup the language manager and loads the specified language-file.
 * 
 * @param langFileName the file-name of the language-file without extension. Must comply to the defined name-schema.
 * @throws {LoadingError} if something goes wrong (In that case the application is unable to operate)
 */
async function setupLanguageManager(langFileName: string){
    // Tries to load the language file
    await loadLanguage(langFileName);

    // Updates the html-page
    cleanHTMLPage();
}

/**
 * Returns the language-value of the current language that is corresponding to the current key and optionally replaces variable-values with the given variables if they are given.
 * 
 * @throws {LoadingError} if the given key doesn't correspond to any values inside the language-table.
 * 
 * !Node! this can and should only be called after the inital setup of the language-manager
 */
function getFromLanguage(key: string, vars?: LVarSet) : string{
    // Checks if there is no language file loaded
    if(loadedLanguage === undefined)
        return handleProgrammingError(`Get a call to Language.get('${key}') before the language is actually loaded`);
    
    // Gets the value
    var val = loadedLanguage[key];

    // Checks if the key exists
    if(val === undefined)
        return handleProgrammingError("Failed to find language key '"+key+"'.");

    // If no variables are given
    if(vars === undefined)
        return val;
    
    // Checks if a default var was given
    if(!isObjectEV(vars))
        // Modifies the vars variable to fit as a default-object
        vars = { "var": vars } as LVarTypeArray
        
    // Searches the string for variables with schema $name$
    return val.replace(/\$\w+\$/gi,mtch=>{
        // Name without the $ at end and start
        var name = mtch.substring(1,mtch.length-1)

        return (vars as LVarTypeArray)[name].toString();
    });
}

export const Language = {
    get: getFromLanguage,
    setup: setupLanguageManager
}