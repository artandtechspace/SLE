// Direction that the bar is in comparision to the scalling-element.
// Eg. if the scalling element is before the slider on the x/y axis it would be forward. 
export enum SliderBarDirection{
    DIRECTION_X_FORWARD = 0,
    DIRECTION_Y_FORWARD = 1,
    DIRECTION_X_BACKWARD = 2,
    DIRECTION_Y_BACKWARD = 3
}

export class SliderBar{

    // Min size that the document has to be
    private static MIN_DOC_SIZE = 200;

    // Elements that the slider deals with
    scallingElement: HTMLElement;
    barElement: HTMLElement

    // Min and max width/height of the scalling-element
    min: number;
    max: number;

    // Direction that the slider goes
    direction: SliderBarDirection;

    public static register(scallingElement: HTMLElement,barElement: HTMLElement, min: number, max: number, direction: SliderBarDirection){
        return new SliderBar(scallingElement,barElement,min,max,direction);
    }

    private constructor(scallingElement: HTMLElement,barElement: HTMLElement, min: number, max: number, direction: SliderBarDirection){
        this.barElement = barElement;
        this.scallingElement = scallingElement;

        this.direction = direction;

        this.min = min;
        this.max = max;

        // Appends the starting event
        this.barElement.addEventListener("mousedown",this.onSidebarDrag);
    }

    // Calculates the new width for an x-axis slider
    private calculateNewWidth(cursorX: number){
        // Check if it must check forward
        if(this.direction === SliderBarDirection.DIRECTION_X_FORWARD)
            return cursorX - this.scallingElement.getBoundingClientRect().x;
        
        // Otherwise backwards
        return this.scallingElement.getBoundingClientRect().x+this.scallingElement.clientWidth-cursorX -2;
    }

    // Calculates the new height for an y-axis slider
    private calculateNewHeight(cursorY: number){
        // Check if it must check forward
        if(this.direction === SliderBarDirection.DIRECTION_Y_FORWARD)
            return cursorY - this.scallingElement.getBoundingClientRect().y;
        
        // Otherwise backwards
        return this.scallingElement.getBoundingClientRect().y+this.scallingElement.clientHeight-cursorY -2;
    }

    // Event: When the slider get's dragged (Forward on x)
    private onSliderMove=(evt: MouseEvent)=>{        
        // Gets which direction is scrolled to (true for x, false for y)
        var isX = (this.direction & 1) === 0;

        // Calculates the new size (Width or height)
        var newSize = isX ? this.calculateNewWidth(evt.pageX) : this.calculateNewHeight(evt.pageY);

        // Gets which document-bounce to check
        var dcBounce = (isX ? document.body.clientWidth : document.body.clientHeight) - SliderBar.MIN_DOC_SIZE;

        // Checks if the size excides the document-bounce
        if(newSize > dcBounce)
            newSize = dcBounce;

        // Ensures the sidebar stays withing it's bounce
        if(newSize < this.min)
            newSize = this.min;
        if(newSize > this.max)
            newSize = this.max;

        // Updates the size
        if(isX)
            this.scallingElement.style.minWidth = newSize+"px";
        else
            this.scallingElement.style.minHeight = newSize+"px";
    }

    // Event: When the sidebar gets released
    private onSidebarReleased=()=>{
        document.removeEventListener("mousemove",this.onSliderMove);
        document.removeEventListener("mouseup",this.onSidebarReleased);
    }

    // Event: When the sidebar get's dragged
    private onSidebarDrag=()=>{
        document.addEventListener("mousemove",this.onSliderMove);
        document.addEventListener("mouseup",this.onSidebarReleased);
    }

};