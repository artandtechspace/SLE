import { SystemError } from "../errorSystem/Errors.js";

// Regex to match variables inside the static html-page
const HTML_MATCHER_REGEX = /^[ \t]*\{\{[ \t]*[\w\-\._]+[ \t]*\}\}[ \t]*$/gi;

// Regex used to filter the variable-name from the whole variable-string
const VAR_NAME_MATCH_REGEX = /[\w\-\._]+/gi;

// Regex to validate the file-name of language files
const LANGUAGE_NAME_REGEX = /^\w{2}_\w{2}$/gi;

// Holds the loaded language if one got loaded
var loadedLanguage: {[key: string]: string};

/**
 * Tries to load a given language file.
 * 
 * @param name the name of the file (Without extension). Must comply with the naming schema.
 * @throws {SystemError} if something goes wrong
 */
async function loadLanguage(name: string){
    // Ensures the loading-name is compliant with the loading schema
    if(!LANGUAGE_NAME_REGEX.test(name))
        throw new SystemError("Failed to load language, requested language file name '"+name+"' does not comply with the file-nameing schema.");

    try{
    
        // Await the language file
        var langAsJson = await (await fetch("resources/languages/"+name+".json")).json();

        // Ensures the file is valid
        if(typeof langAsJson !== "object" || langAsJson.constructor.name !== "Object")
            throw "Requested language file doesn't contain a valid language-object.";

        // Ensures the file contains only an object with string values
        if(!Object.values(langAsJson).every(x=>typeof x === "string"))
            throw "Requested language file doesn't contain a valid language-object.";
        
        // Stores the loaded language
        loadedLanguage = langAsJson;
    }catch(e){
        throw new SystemError("Failed to catch language-file '"+name+"': "+e);
    }
}

/**
 * Scanns the whole static html-page and replaced variables with the actuall language-code
 */
function cleanHTMLPage(){
    // Filters all html-elements that contain a variable-language string
    var varNodes = Array.from(document.querySelectorAll("*")).filter(x=>HTML_MATCHER_REGEX.test(x.textContent || ""));

    // Function the take in an html-element that is sure to have a variable-context and updates it
    function apply2Node(elm: Element){
        // Gets the variable-name
        var varname = elm.textContent!.match(VAR_NAME_MATCH_REGEX)![0];
        // Updates the element
        elm.textContent = getFromLanguage(varname);
    }

    // Applys the document-changes
    varNodes.forEach(apply2Node);
}

/**
 * Setup the language manager and loads the specified language-file.
 * 
 * @param langFileName the file-name of the language-file without extension. Must comply to the defined name-schema.
 * @throws {SystemError} if something goes wrong (In that case the application is unable to operate)
 */
export async function setupLanguageManager(langFileName: string){
    // Tries to load the language file
    await loadLanguage(langFileName);

    // Updates the html-page
    cleanHTMLPage();
}

/**
 * Returns the language-value of the current language that is corresponding to the current key and optionally replaces variable-values with the given variables if they are given.
 * 
 * @throws {SystemError} if the given key doesn't correspond to any values inside the language-table.
 * 
 * !Node! this can and should only be called after the inital setup of the language-manager
 */
export function getFromLanguage(key: string, variables?: {[key:string]: (number|string|boolean)}){
    // Gets the value
    var val = loadedLanguage[key];

    // Checks if the key exists
    if(val === undefined)
        throw new SystemError("Failed to find language key '"+key+"'.");

    // If no variables are given
    if(variables === undefined)
        return val;
    
    // Searches the string for variables
    return val.replace(/\$\w+\$/gi,mtch=>{
        return variables[mtch.substring(1,mtch.length-1)].toString();
    });
}