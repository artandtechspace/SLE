import { getFromLanguage } from "../language/LanguageManager.js";

/**
 * Toolbox for the blockly workspace
 */
export const TB_COLOR_COLOR = 45;
export const TB_COLOR_CONTROL = 210;
export const TB_COLOR_VALUES = 20;
export const TB_COLOR_ANIMATIONS = 120;

// Builds the toolbox
export function buildToolBox(){
  return {
      "kind": "categoryToolbox",
      "contents": [
        category("color", TB_COLOR_COLOR,[
          block("sle_simple_single_color",{
            "led": inputNumber(0)
          }),
  
          block("sle_simple_stripe_color",{
            "start": inputNumber(0),
            "end": {
              block: {
                type: "sle_values_ledamount"
              }
            }
          }),
          block("sle_steps_color",{
            "start": inputNumber(0),
            "steps": inputNumber(1),
            "space-between-steps": inputNumber(1),
            "step-length": inputNumber(1),
          })
        ]),
        
        category("control", TB_COLOR_CONTROL,[
          block("sle_control_delay",{
            "time": inputNumber(50)
          }),
  
          block("sle_control_loop",{
            "repeat-amount": inputNumber(2)
          }),
          block("sle_control_comment")
        ]),
        category("values", TB_COLOR_VALUES, [
          block("math_number"),
          block("sle_values_ledamount")
        ]),
        category("animations", TB_COLOR_ANIMATIONS, [
          block("sle_animation_gradient",{
            "start": inputNumber(0),
            "length": inputNumber(5),
            "delay": inputNumber(100)
          }),
          block("sle_animation_rainbow",{
            "from": inputNumber(0),
            "length": inputNumber(5),
            "offsetPerLed": inputNumber(-500),
            "playLenght": inputNumber(5000),
            "repeatLength": inputNumber(5000)
          })
        ])
      ]
  
  }
}


//#region Toolbox-build methods

// Build a category
function category(nameKey: string, color: number, content: any[] = []){
  return {
    "kind": "category",
    "name": getFromLanguage("ui.blockly.toolbox.categorys."+nameKey),
    "contents": content,
    "colour": color.toString()
  }
}

// Build a block
function block(name: string, inputs?: {[k:string]:any}){
  return {
    "kind": "block",
    "type": name,
    "inputs": inputs
  }
}

// Takes in the number that the math_number shall have and returns the block's object
// This can only be used to add subnumbers to blocks
function inputNumber(num: number){
  return {
    "block":{
      "type": "math_number",
      "fields": {
        "NUM": num
      }
    }
  }
}

//#endregion