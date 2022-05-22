import { PercentageNumber } from "../types/Types.js";
import { printEquation } from "../utils/EquationUtils.js";
import { tenaryLargerThan } from "./CodeGenerationUtils.js";
import { CppFuncParam } from "./variablesystem/CppFuncDefs.js";
import { Variable } from "./variablesystem/Variable.js";

/**
 * Generates a hue equation that scales linear from start to end if the starting value is before the end value,
 * but otherwise can also go around the other side of the hue-scale.
 * 
 * @param perc percentage where the animation is at
 * @param hueFrom starting value
 * @param hueTo end value
 */
export function generateHUECalculation(perc: Variable, hueFrom: CppFuncParam<PercentageNumber>, hueTo: CppFuncParam<PercentageNumber>){
    // Hue-equations (Positive and negative)
    const positiveHueEq = "(int)(255 * ( $clrFrm + ($clrTo + 1 - $clrFrm) * $perc)) % 255";
    const negativeHueEq = "255 * ($clrFrm + $perc * ($clrTo - $clrFrm))";

    // Values to insert into the equations
    var values = {
        "clrFrm": hueFrom.value,
        "clrTo": hueTo.value,
        "perc": perc
    };

    // Gets the calculator-string for the hue-value
    return tenaryLargerThan(hueFrom,hueTo,
        ()=>printEquation(positiveHueEq,values),
        ()=>printEquation(negativeHueEq,values)
    ) as string;
}


/**
 * Generates a commonly used equation to scale between a starting and end value (as percentage) based on a percentage variable.
 * There is also a scaling-factor that can be passed to scale the given values up to this factor.
 * For single-color values like hsv (h, s or v) or rgb (r, g or b) this would usually be 255.
 * 
 * @param perc the percentage variable
 * @param valueFrom starting value 
 * @param valueTo ending value
 * @param factor the scaling factor
 * @returns the equation
 */
export function generateLinearScalingEquation(perc: Variable, valueFrom: CppFuncParam<PercentageNumber>, valueTo: CppFuncParam<PercentageNumber>, factor?: number) {
    // Generates the equation
    var equation = printEquation("$from + $perc * ($to - $from)", {
        "perc": perc,
        "from": valueFrom.value,
        "to": valueTo.value
    });

    // Returns it with a scaling factor if given
    return factor === undefined ? factor : `(${equation}) * ${factor}`;
}