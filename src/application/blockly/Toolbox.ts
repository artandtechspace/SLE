/**
 * Toolbox for the blockly workspace
 */
export const Toolbox = {
    "kind": "flyoutToolbox",
    "contents": [
      {
          "kind": "block",
          "type": "sle_simple_single_color",
          "inputs": {
            "led": buildSubNumber(0)
          }
      },{
        "kind": "block",
        "type": "sle_control_loop",
        "inputs": {
          "loopAmount": buildSubNumber(1)
        }
      },{
        "kind": "block",
        "type": "sle_control_delay",
        "inputs": {
          "time": buildSubNumber(50)
        }
      },{
        "kind": "block",
        "type": "sle_simple_stripe_color",
        "inputs": {
          "start": buildSubNumber(0),
          "end": buildSubNumber(5),
        }
      },{
        "kind": "block",
        "type": "sle_steps_color",
        "inputs":{
          "start": buildSubNumber(0),
          "steps": buildSubNumber(1),
          "skipLen": buildSubNumber(1),
          "skipStart": buildSubNumber(1),
        }
      },{
        "kind": "block",
        "type": "math_number"
      }
    ]

}


//#region Toolbox-build methods

// Takes in the number that the math_number shall have and returns the block's object
// This can only be used to add subnumbers to blocks
function buildSubNumber(num: number){
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