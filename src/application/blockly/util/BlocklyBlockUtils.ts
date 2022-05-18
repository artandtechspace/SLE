import { BlockError } from "../../errorSystem/Errors.js";
import { ConfigBuilder } from "../../ConfigBuilder.js";
import { HexColor, isPercentageNumber, Max, Min, PercentageNumber, RGB } from "../../types/Types.js";
import { HSV2HEX, HSV2RGB } from "../../utils/ColorUtils.js";
import { Environment } from "../../Environment.js";

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
export function getNumberFromCodeAsPercentage(block: any, field: string, env: Environment) : PercentageNumber{
    // Gets the number
    var val = getNumberFromCode(block,field,env);

    // Ensures that the number is within the required range.
    if(!isPercentageNumber(val))
        throw new BlockError(`The '${field}'-value must be a percentage-number`,block);

    return val;
}

/**
 * @throws {BlockError} if anything is not alright
 * @returns the searched number as a min
 */
export function getNumberFromCodeAsMin<minimum extends number>(block: any, field: string, min: minimum, env: Environment) : Min<minimum>{
    // Gets the number
    var val = getNumberFromCode(block,field,env);

    // Ensures that the number is within the required range.
    if(val < min)
        throw new BlockError(`The '${field}'-value must be >= ${min}`,block);

    return val as Min<minimum>;
}

/**
 * @throws {BlockError} if anything is not alright
 * @returns the searched number as a max
 */
export function getNumberFromCodeAsMax<maximum extends number>(block: any, field: string, max: maximum, env: Environment) : Max<maximum>{
    // Gets the number
    var val = getNumberFromCode(block,field,env);

    // Ensures that the number is within the required range.
    if(val > max)
        throw new BlockError(`The '${field}'-value must be <= ${max}`,block);

    return val as Max<maximum>;
}

/**
 * @throws {BlockError} if anything is not alright
 * @returns the searched number from the field
 */
export function getNumberFromCode(block: any,field: string, env:Environment) {
    // Reads the value and passes it
    var val = parseInt(ConfigBuilder.getValueFromSupplier(block.getInputTargetBlock(field), env));

    // Ensures that the number is valid
    if(isNaN(val))
        throw new BlockError(`The '${field}'-value is not given.`,block);

    return val;
}
