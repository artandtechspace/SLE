export class Arduino{

    // Delay function with an empty default callback
    private __delayFunc: (amount:number)=>Promise<unknown> = async()=>{};
    
    // Callback when the leds are getting updated
    private __onPushLeds: (leds: string[])=>void;

    // Array with all string for the led colors
    private __leds: string[] = [];

    // Time when the object got created
    private __startTime: number = Date.now();

    /**
     * The @param onPushLeds is a function that takes in an array with strings that contain the colors of their corresponding leds
     */
    public constructor(onPushLeds: (leds: string[])=>void){
        this.__onPushLeds = onPushLeds;
    }

    /**
     * Inits the class in gernal and setups it for later use.
     * The @param delayFunc will be used to performs delays in the simulation.
     */
    public __init(delayFunc: (amount:number)=>Promise<unknown>){
        this.__delayFunc=delayFunc;
    }



    /**
     * Returns the amount of millis passed since the start of the animation.
     * @returns 
     */
    public millis(){
        return this.__startTime-Date.now();
    }

    /**
     * Functions as the delay() method of an arduino.
     * @param ms how many milliseconds the arduino should delay/wait.
     * @returns the promis that has to be awaited
     */
    public async delay(ms: number){
        return this.__delayFunc(ms);
    }

    /**
     * Used to send the update to the arduino. This is the equaivilent to the FastLED.show() method
     */
    pushLeds(){
        // Sends the update
        this.__onPushLeds(this.__leds);
        // Clears the leds
        this.__leds=[];
    }

    /**
     * @param id id of the led
     * @param hex hex-code (RRGGBB) for the led-color
     */
    setLedHex(id: number, hex: string){
        this.__leds[id] = `#${hex}`;
    }

    /**
     * @param id id of the led
     * @param r red value (0-255)
     * @param g green value (0-255)
     * @param b blue value (0-255)
     */
    setLedRGB(id: number,r: number,g: number,b: number){
        this.__leds[id] = `rgb(${r},${g},${b})`;
    }

    /**
     * @param id id of the led
     * @param h hue as a percentage (0.00-1.00)
     * @param s saturation as a percentage (0.00-1.00)
     * @param v value as a percentage (0.00-1.00)
     */
    setLedHSV(id: number,h: number,s: number,v: number){
        this.__leds[id] = `hsl(${h/255*360},${s/255*100}%,${v/255*100}%)`
    }

}