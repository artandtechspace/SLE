import { BlockError } from "../../errorSystem/Errors.js";
import { ConfigBuilder } from "../../ConfigBuilder.js";
import { HexColor, isMin, isPercentageNumber, Max, Min, PercentageNumber, RGB } from "../../types/Types.js";
import { HSV2HEX, HSV2RGB } from "../../utils/ColorUtils.js";
import { SettingsUI } from "../settingsui/SettingsUI.js";
import { handleProgrammingError } from "../../errorSystem/ProgrammingErrorSystem.js";
import { performCalculation } from "../../parameterCalculator/Calculator.js";
import { LanguageRef } from "../../language/LanguageManager.js";

/**
 * Checks if the block has a settings ui and get's the value from the field in question.
 * Also this assumes that the field in question actually returnes the correct data-type
 * @throws {BlockError} if the value on the block is currently invalid
 * @returns the searched number from the settings-ui-field (Reference by the @param name)
 */
export function getValueFromSettingsUI<Expect>(block: any, name: string) : Expect {
    // Gets the settingsui
    var setUi: SettingsUI = (block.settingsui as SettingsUI);

    // Checks if the ui is set
    if(setUi === undefined)
        return handleProgrammingError("There is no settings-ui defined but the element '"+name+"' is expected.");

    try{
        return setUi.validateAndGetValueByName<Expect>(block, name);
    }catch(e){
        const ref = e as LanguageRef; 
        throw new BlockError(block, ref.key, ref.vars)
    }
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
        throw new BlockError(block, `blocks.errors.fields.numeric.percentage`, field);

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
        throw new BlockError(block, "blocks.errors.fields.numeric.min", {
            "field": field,
            "min": min
        });

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
        throw new BlockError(block, "blocks.errors.fields.numeric.max", {
            "field": field,
            "max": max
        });

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
        throw new BlockError(block, "blocks.errors.fields.numeric.nan", field);

    return val;
}





export function getParametricNumber(block: any, field: string, allowFloat: boolean = true){
    // Reads the value and passes it
    var val: string = block.getFieldValue(field);

    try{
        // Performs the calculation
        var value = performCalculation(val);
    
        return allowFloat ? value : Math.round(value);
    }catch(e){
        const ref = e as LanguageRef;
        throw new BlockError(block, ref.key, ref.vars);
    }
}

export function getParametricNumberMin<minimum extends number>(block: any, field: string, min: minimum, allowFloat: boolean = true) {
    var x = getParametricNumber(block,field, allowFloat);

    if(isMin(x, min))
        return x;

    throw new BlockError(block, "blocks.errors.fields.numeric.min", {
        "field": field,
        "min": min
    });
}