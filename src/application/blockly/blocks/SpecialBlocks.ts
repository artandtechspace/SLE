import { Language } from "../../language/LanguageManager";

const Blockly = require("blockly");

/**
 * Registers all special blocks. Like the root block
 */

export default function registerSpecialBlocks(){
    registerSetup("sle_setup");
    registerLoop("sle_root");
}


// Setup-root-block (All others shall be disabled)
function registerSetup(name: string){
    Blockly.Blocks[name] = {
        init: function() {
          this.appendDummyInput()
              .appendField(Language.get("ui.blockly.block.special.setup"));
          this.setNextStatement(true, null);
          this.setDeletable(false);
          this.setEditable(false);
          this.setMovable(true);
        }
    };
}

// Loop-root-block (All others shall be disabled)
function registerLoop(name: string){
    Blockly.Blocks[name] = {
        init: function() {
          this.appendDummyInput()
              .appendField(Language.get("ui.blockly.block.special.loop"));
          this.setNextStatement(true, null);
          this.setDeletable(false);
          this.setEditable(false);
          this.setMovable(true);
        }
    };
}