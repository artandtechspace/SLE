import { Language } from "../../language/LanguageManager";
import { IS_DEBUGGING } from "../../Preset";

/**
 * Toolbox for the blockly workspace
 */
export const TB_COLOR_COLOR = 45;
export const TB_COLOR_CONTROL = 210;
export const TB_COLOR_ANIMATIONS = 120;
export const TB_COLOR_GOGGLES = 300;

export const TB_COLOR_DEBUG = 180;

// Builds the toolbox
export function buildToolBox(){
  return {
      "kind": "categoryToolbox",
      "contents": [
        category("color", TB_COLOR_COLOR,[
          block("sle_simple_single_color"),

          block("sle_simple_stripe_color"),

          block("sle_simple_turnoff_color")
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
          block("sle_goggles_turnoff"),
          block("sle_goggles_color_lense"),
          block("sle_goggles_color"),
          block("sle_goggles_fade"),
          block("sle_goggles_gradient"),
          block("sle_goggles_rainbow")
        ]),

        // This category will only be added in debugging-mode
        categoryDebug([
          block("sle_debug_1"),
        ])


      ].filter(x=>x!==undefined)
  }
}


//#region Toolbox-build methods

// Builds the debug-category only if the debugging flag is set
function categoryDebug(content: any[]){
  if(IS_DEBUGGING)
    return {
      "kind": "category",
      "name": "Debug",
      "contents": content,
      "colour": TB_COLOR_DEBUG.toString()
    }
}

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