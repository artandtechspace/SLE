/**
 * Toolbox for the blockly workspace
 */
export const Toolbox = {
    "kind": "categoryToolbox",
    "contents": [
      category("Color", 130,[
        block("sle_simple_single_color",{
          "led": inputNumber(0)
        }),

        block("sle_simple_stripe_color",{
          "start": inputNumber(0),
          "end": inputNumber(5)
        }),
        block("sle_steps_color",{
          "start": inputNumber(0),
          "steps": inputNumber(1),
          "space-between-steps": inputNumber(1),
          "step-length": inputNumber(1),
        })
      ]),
      
      category("Control", 210,[
        block("sle_control_delay",{
          "time": inputNumber(50)
        }),

        block("sle_control_loop",{
          "repeat-amount": inputNumber(2)
        }),
        block("math_number")
      ])
    ]

}


//#region Toolbox-build methods

// Build a category
function category(name: string, color: number, content: any[] = []){
  return {
    "kind": "category",
    "name": name,
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