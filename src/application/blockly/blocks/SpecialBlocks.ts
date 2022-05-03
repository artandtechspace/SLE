const Blockly = require("blockly");

export default function registerSpecialBlocks(){
    registerRoot("sle_root");
}


// Root-block (All others shall be disabled)
function registerRoot(name: string){
    Blockly.Blocks[name] = {
        init: function() {
          this.appendDummyInput()
              .appendField("Program-Plan");
          this.setNextStatement(true, null);
          this.setDeletable(false);
          this.setEditable(false);
          this.setMovable(false);
        }
    };
}