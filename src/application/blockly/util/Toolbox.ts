import { Language } from "../../language/LanguageManager.js";

/**
 * Toolbox for the blockly workspace
 */
export const TB_COLOR_COLOR = 45;
export const TB_COLOR_CONTROL = 210;
export const TB_COLOR_ANIMATIONS = 120;
export const TB_COLOR_GOGGLES = 45;

export const TB_COLOR_DEBUG = 300;

// Builds the toolbox
export function buildToolBox(){
  return {
      "kind": "categoryToolbox",
      "contents": [
        category("color", TB_COLOR_COLOR,[
          block("sle_simple_single_color"),

          block("sle_simple_stripe_color"),
        ]),

        category("control", TB_COLOR_CONTROL,[
          block("sle_control_delay"),
  
          block("sle_control_loop"),
          block("sle_control_comment")
        ]),

        category("animations", TB_COLOR_ANIMATIONS, [
          block("sle_animation_gradient"),
          block("sle_animation_rainbow"),
          block("sle_animation_fade"),
          block("sle_animation_rainbow_autocalc")
        ]),

        category("goggles", TB_COLOR_GOGGLES, [
          block("sle_goggles_color"),
        ]),

        // TODO: Disable debug
        category("debug", TB_COLOR_DEBUG, [
          block("sle_debug"),
          block("sle_color_debug")
        ])
      ]
  }
}


//#region Toolbox-build methods

// Build a category
function category(nameKey: string, color: number, content: any[] = []){
  return {
    "kind": "category",
    "name": Language.get("ui.blockly.toolbox.categorys."+nameKey),
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