import { StopableCallchain } from "../utils/StopableCallchain.js";
import { Arduino } from "./Arduino.js";
import { InvalidValueError } from "../errorSystem/Errors.js";
import { getFullRuntime } from "../modules/ModuleUtils.js";
import { ModBlockExport } from "../ConfigBuilder.js";
import { Min } from "../types/Types.js";
import { handleProgrammingError } from "../errorSystem/ProgrammingErrorSystem.js";

export class ArduinoSimulation{

    // Contains a list with all led-items from the preview (This exists for performance reasons)
    // It is also always ensured that, if loaded, this element has at least one led
    private leds: HTMLElement[] = [];

    // Callchain
    private callchain = new StopableCallchain();

    // Container of the preview-svg
    private previewContainer: HTMLElement;

    constructor(preview: HTMLElement){
        this.previewContainer = preview;
    }

    /**
     * Event: When an light-update get's pushed from the modules
     * @param lightUpdates string-array with the led-indexes and their new colors. These colors are directly inserted as css, so they can be anythin from rgb(...) over hsl(...) to normal hex values (RRGGBB).
     */
    private onPushLeds(lightUpdates: string[]){
        // Iterates over every update
        for(var updateId in lightUpdates){
            // Gets the update object
            var update = lightUpdates[updateId];

            // Iterates over every light
            for(var led of this.leds){
                var id = led.getAttribute("led");

                // Checks if the led-index doesn't match
                if(id !== updateId)
                    continue;
                    
                // Updates the style
                led.style.fill=update;
            }
        }
    }

    /**
     * Clears the led's on the svg and resets them to black
     */
    private clearLeds(){
        this.leds.forEach(led=>led.style.fill="black");
    }

    /**
     * Loads the given svg as the preview.
     * This must be called at least once before any other functions of this class can be used.
     * If the preview is overwritten and there is an error
     * 
     * @param svg the preview-element
     * 
     * @throws {InvalidValueError} if there is an error with loading the preview-element
     */
    public loadPreview(svg: SVGElement){
        // Gets all leds
        var leds = Array.from(svg.querySelectorAll("[led]")) as HTMLElement[];

        // Ensures that the leds could be loaded
        if(leds.length <= 0)
            return handleProgrammingError("No leds could be found.");

        this.leds = leds;

        // Attaches the preview
        this.previewContainer.innerHTML="";
        this.previewContainer.appendChild(svg);
    }

    /**
     * Starts the simulation by running the given config
     * @param setupCfg setup-config-object that got generated by blockly.
     * @param loopCfg loop-config-object that got generated by blockly.
     */
    public startSimulation(setupCfg: ModBlockExport<any>[], loopCfg: ModBlockExport<any>[]){
        // Calclates the estimated runtime of the loop-block
        var estimatedLoopRuntime = getFullRuntime(loopCfg);

        // Stops the current simulation 
        this.stopSimulation();

        // Creates the arduino
        var arduino = new Arduino(this.onPushLeds.bind(this));

        // Prepares the modules and invokes their setup-methods.

        // Mapper to converts the config to the modules and executes the simulated setup
        function setupMapper(cfg: ModBlockExport<any>){
            // Creates the mod-object
            var modObj = {
                ...cfg,
                ssot: {}
            }

            // Executes the setup
            modObj.module.simulateSetup(modObj.config,modObj.ssot,arduino);

            return modObj;
        }

        // Converts setup and loop to modules and simulates their setup-routines
        var setupModObjects = setupCfg.map(setupMapper);
        var loopModObjects = loopCfg.map(setupMapper);

        // Starts the arduin-simulation-loop
        this.callchain.startChain(async(delay)=>{
            // Inits the arduino
            arduino.init(delay);

            // Performs the setup
            for(var obj of setupModObjects)
                await obj.module.simulateLoop(obj.config,obj.ssot,arduino);

            while(true){
                for(var obj of loopModObjects)
                    await obj.module.simulateLoop(obj.config,obj.ssot,arduino);
                
                // Default delay to prevent infinitely fast loops
                if(estimatedLoopRuntime < 1000)
                    await delay(1000);
            }
        });

    }

    /**
     * Stops the simulation if it was been running
     */
    public stopSimulation(){
        this.callchain.stop();
        this.clearLeds();
    }

    // Returns how many leds got found
    public getLedAmount(): Min<1>{
        return this.leds.length as Min<1>;
    }

}