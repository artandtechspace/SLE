/**
 * Small file with small utilities to build html-elements using javascript. This is used in place of a big framework which would benefit little but contribute with a big size.
 */



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
export function create(tag: string, {cls = undefined, id = undefined, text = undefined, chld = [], attr = {}, evts = {}}: any = {}) : HTMLElement{
  // Creates the element
  var elm = document.createElement(tag);

  // Appends class
  if(cls)
    elm.classList.add(cls);

  // Appends id
  if(id)
    elm.id=id;
  
  // Appends text
  if(text)
    elm.textContent = text;

  // Appends children
  for(var x of chld)
    elm.appendChild(x);

  // Appends children
  for(var y in attr)
    elm.setAttribute(y,attr[y as keyof typeof attr]);
    
  // Appends events
  for(var z in evts)
    elm.addEventListener(z,evts[z as keyof typeof evts]);

  return elm;
}