import { BlockError } from "../errorSystem/Error.js";
import { ConfigBuilder } from "../ConfigBuilder.js";
import { HexColor, Max, Min } from "../types/Types.js";
import { HSV2HEX } from "../utils/ColorUtils.js";

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
 * @throws {BlockError} if anything is not perfectly expected with the number.
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
 * @throws {BlockError} if anything is not perfectly expected with the number.
 * @returns the searched number as a min
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
 * @throws {BlockError} if anything is not perfectly expected with the number.
 * @returns the searched number as a min
 */
export function getNumberFromCode(block: any,field: string) {
    // Reads the value and passes it
    var val = parseInt(ConfigBuilder.getValueFromSupplier(block.getInputTargetBlock(field)));

    // Ensures that the number is valid
    if(isNaN(val))
        throw new BlockError(`The '${field}'-value is not given.`,block);

    return val;
}
