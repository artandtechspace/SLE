import { Error, SystemError } from "../errorSystem/Error.js";

/**
 * Element that takes in a function that shall appear to run sync but internally runs async and can be intercepted.
 */
export class StopableCallchain{

    // Callbacks for the internal promise
    private errorCallback: null|((value: unknown)=>void) = null;
    private successCallback: null|((value: unknown)=>void) = null;

    private timeoutId: NodeJS.Timeout|null = null;

    /**
     * Internal function that get's pass via arguments to the outside.
     * This blocks the code for the given amount of time, making it possible to simulate a clean sync delay.
     * To have that, just await this statement with your given time.
     * 
     * @param {number} amt how long to wait
     */
    private async _delay(amt: number){
        // Starts the timeout
        this.timeoutId = setTimeout(() => {
            this.timeoutId = null;
            
            // Executes the finish
            (this.successCallback as CallableFunction)();
            
            // Removes the reject key
            this.errorCallback = null;
        }, amt);

        // Starts the task
        return new Promise((resolve,reject)=>{
            this.errorCallback = reject;
            this.successCallback = resolve;
        });
    }

    /**
     * Starts the sync execution of the callchain.
     * This takes in a function @param asnyChain which itself takes a function as a parameter.
     * This function is the async-delay method that must be awaited to stop the execution.
     */
    startChain(asyncChain: (delayFunc: (amount: number)=>Promise<unknown>)=>Promise<void>){
        // Stops any previously started chain
        this.stop();

        // Starts the new chain
        asyncChain(this._delay.bind(this)).catch(e=>{
            if(e !== "callchain.stop")
                throw e instanceof Error ? e : new SystemError(e);
        });

    }

    /**
     * Stops the current call if there is one executing
     */
    stop(){
        // Checks if there is currently a delay going on
        if(this.timeoutId === undefined)
            return;

        // Prevents the timeout from fireing
        clearTimeout(this.timeoutId as NodeJS.Timeout);
        
        // Executes the error-callback
        if(this.errorCallback)
            (this.errorCallback as CallableFunction)("callchain.stop");

        // Reset
        this.errorCallback = this.successCallback = this.timeoutId = null;
    }

}