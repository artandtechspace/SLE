import { BlockError, InvalidValueError } from "../../errorSystem/Errors.js";
import { ConfigBuilder } from "../../ConfigBuilder.js";
import { HexColor, isPercentageNumber, Max, Min, PercentageNumber, RGB } from "../../types/Types.js";
import { HSV2HEX, HSV2RGB } from "../../utils/ColorUtils.js";
import { Environment } from "../../Environment.js";
import { SettingsUI } from "../settingsui/SettingsUI.js";
import { handleProgrammingError } from "../../errorSystem/ProgrammingErrorSystem.js";

/**
 * @throws {InvalidValueError} if the value on the block is currently invalid
 * @returns the searched number from the settings-ui-field (Reference by the @param name)
 */
export function getNumberFromSettingsUI(block: any, name: string) : number{
    // Gets the settingsui
    var setUi: SettingsUI = (block.settingsui as SettingsUI);

    // Checks if the ui is set
    if(setUi === undefined)
        return handleProgrammingError("There is no settings-ui defined but the element '"+name+"' is expected.");

    // Gets the value
    var ret = setUi.getValueByName<number>(name);

    // Checks for an error
    if(typeof ret === "string")
        throw new InvalidValueError(ret);

    // Gives back the valid value
    return ret;
}

/** 
 * @returns the hex-color from a custom-color-field. This expects to get passed a custom-color-field
 */
export function getHexFromCode(block: any, field: string) : HexColor{
    // Gets the value
    var hsv = block.getFieldValue(field);

    // Converts the color to a hex-color
    return HSV2HEX(hsv.h,hsv.s,hsv.v, true) as HexColor;
}

/**
 * @returns the rgb-color from a custom-color-field. This expects to get passed a custom-color-field
 */
export function getRGBFromCode(block: any, field: string) : RGB{
    // Gets the value
    var hsv = block.getFieldValue(field);

    // Converts the color to rgb
    return HSV2RGB(hsv.h,hsv.s,hsv.v);
}

/**
 * @throws {BlockError} if anything is not alright
 * @returns the searched number as a percentage
 */
export function getNumberFromCodeAsPercentage(block: any, field: string) : PercentageNumber{
    // Gets the number
    var val = getNumberFromCode(block,field);

    // Ensures that the number is within the required range.
    if(!isPercentageNumber(val))
        throw new BlockError(`The '${field}'-value must be a percentage-number`,block);

    return val;
}

/**
 * @throws {BlockError} if anything is not alright
 * @returns the searched number as a min
 */
export function getNumberFromCodeAsMin<minimum extends number>(block: any, field: string, min: minimum) : Min<minimum>{
    // Gets the number
    var val = getNumberFromCode(block,field);

    // Ensures that the number is within the required range.
    if(val < min)
        throw new BlockError(`The '${field}'-value must be >= ${min}`,block);

    return val as Min<minimum>;
}

/**
 * @throws {BlockError} if anything is not alright
 * @returns the searched number as a max
 */
export function getNumberFromCodeAsMax<maximum extends number>(block: any, field: string, max: maximum) : Max<maximum>{
    // Gets the number
    var val = getNumberFromCode(block,field);

    // Ensures that the number is within the required range.
    if(val > max)
        throw new BlockError(`The '${field}'-value must be <= ${max}`,block);

    return val as Max<maximum>;
}

/**
 * @throws {BlockError} if anything is not alright
 * @returns the searched number from the field
 */
export function getNumberFromCode(block: any,field: string) {
    // Reads the value and passes it
    var val = parseInt(ConfigBuilder.getValueFromSupplier(block.getInputTargetBlock(field)));

    // Ensures that the number is valid
    if(isNaN(val))
        throw new BlockError(`The '${field}'-value is not given.`,block);

    return val;
}
