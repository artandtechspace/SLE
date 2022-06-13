/**
 * Small file with small utilities to build html-elements using javascript.
 * This is used in place of a big framework which would benefit little but contribute with a big size.
 */

export type CreateArguments = {
  cls?: string,
  id?: string,
  chld?: (HTMLElement|undefined)[],
  attr?: {[key: string]: any},
  evts?: {[key: string]: any},
  text?: string
}

/**
 * Function to create html-element with little code
 * 
 * @param {String} tag HTML-Tag name 
 * @param {String} cls (Optional) a class to append to the element
 * @param {String} id (Optional) an id to append to the element
 * @param {Array[HTMLElement]} chld (Optional) children to append to the element
 * @param {Object} attr (Optional) attributes to append to the element
 * @param {Object} evts (Optional) events to append to the element
 * @param {String} text (Optional) text to set as the textContent of the element
 * @returns the fully created HTML-Element
 */
export function create(tag: string, {cls,id,text,chld,attr,evts}: CreateArguments = {}) : HTMLElement{
  // Creates the element
  var elm = document.createElement(tag);

  // Appends class
  if(cls)
    elm.className = cls;

  // Appends id
  if(id)
    elm.id=id;
  
  // Appends text
  if(text)
    elm.textContent = text;

  // Appends children
  if(chld !== undefined)
    for(var child of chld)
      if(child !== undefined)
        elm.appendChild(child);

  // Appends attributes
  for(var attribute in attr)
    if(attribute !== undefined)
      elm.setAttribute(attribute,attr[attribute as keyof typeof attr]);
    
  // Appends events
  for(var z in evts)
    elm.addEventListener(z,evts[z as keyof typeof evts]);

  return elm;
}


// Performs the create-function only if the given equation resolves to true
export function createIf(tag: string, args: CreateArguments, equation: boolean) : HTMLElement|undefined {
  return equation ? create(tag, args) : undefined;
}