import { DesyncedWorkspaceError } from "../../errorSystem/Errors.js";
import { getWorkspace } from "../../SharedObjects.js";

/**
 * Gets the root blocks from the workspace.
 * 
 * @throws {DesyncedWorkspaceError} If there are multiple non-disabled blocks or non-disabled and non-root blocks
 */
export function getRootBlocks(){
	// Gets all blocks that
	var blocks: any[] = getWorkspace().getTopBlocks().filter((block:any)=>!block.disabled);

	// Checks the length
	if(blocks.length <= 1)
		throw new DesyncedWorkspaceError("ui.blockly.workspace.desynced.noroot");

	// Checks the length
	if(blocks.length > 2)
		// Checks if there is one block beeing dragged
		if(!getWorkspace().isDragging())
			throw new DesyncedWorkspaceError("ui.blockly.workspace.desynced.multipleblocks");
	
	
	// Gets the blocks indexes
    var loopIdx = blocks.findIndex(blg=>blg.type==="sle_root");
    var setupIdx = blocks.findIndex(blg=>blg.type==="sle_setup");

	// Ensures that root and setup got found
	if(loopIdx === -1 || setupIdx === -1)
		throw new DesyncedWorkspaceError("ui.blockly.workspace.desynced.noroot");

	return {
        setup: blocks[setupIdx],
        loop: blocks[loopIdx]
    };
}
