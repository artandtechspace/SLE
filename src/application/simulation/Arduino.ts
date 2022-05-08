export class Arduino{

    // Delay function with an empty default callback
    private delayFunc: (amount:number)=>Promise<unknown> = async()=>{};
    
    // Callback when the leds are getting updated
    private onPushLeds: (leds: string[])=>void;

    // Array with all string for the led colors
    private leds: string[] = [];

    // Time when the object got created
    private startTime: number = Date.now();

    /**
     * The @param onPushLeds is a function that takes in an array with strings that contain the colors of their corresponding leds
     */
    public constructor(onPushLeds: (leds: string[])=>void){
        this.onPushLeds = onPushLeds;
    }

    /**
     * Inits the class in gernal and setups it for later use.
     * The @param delayFunc will be used to performs delays in the simulation.
     */
    public init(delayFunc: (amount:number)=>Promise<unknown>){
        this.delayFunc=delayFunc;
    }



    /**
     * Returns the amount of millis passed since the start of the animation.
     * @returns 
     */
    public millis(){
        return this.startTime-Date.now();
    }

    /**
     * Functions as the delay() method of an arduino.
     * @param ms how many milliseconds the arduino should delay/wait.
     * @returns the promis that has to be awaited
     */
    public async delay(ms: number){
        return this.delayFunc(ms);
    }

    /**
     * Used to send the update to the arduino. This is the equaivilent to the FastLED.show() method
     */
    public pushLeds(){
        // Sends the update
        this.onPushLeds(this.leds);
        // Clears the leds
        this.leds=[];
    }

    /**
     * @param id id of the led
     * @param hex hex-code (RRGGBB) for the led-color
     */
    public setLedHex(id: number, hex: string){
        this.leds[id] = `#${hex}`;
    }

    /**
     * @param id id of the led
     * @param r red value (0-255)
     * @param g green value (0-255)
     * @param b blue value (0-255)
     */
     public setLedRGB(id: number,r: number,g: number,b: number){
        this.leds[id] = `rgb(${r},${g},${b})`;
    }

    /**
     * @param id id of the led
     * @param h hue as a percentage (0.00-1.00)
     * @param s saturation as a percentage (0.00-1.00)
     * @param v value as a percentage (0.00-1.00)
     */
     public setLedHSV(id: number,h: number,s: number,v: number){
        let hsv2hsl = (h:number,s:number,v:number,l=v-v*s/2, m=Math.min(l,1-l)) => [h,m?(v-l)/m:0,l];
        var nums = hsv2hsl(h*360,s,v);
        this.leds[id] = `hsl(${nums[0]},${nums[1]*100}%,${nums[2]*100}%)`
    }

}