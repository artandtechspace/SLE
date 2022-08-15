import { S, setClass } from "../../../ui/utils/UiUtils.js";
import { create as C, createIfElse } from "../../../utils/HTMLBuilder.js";
import { printIf } from "../../../utils/WorkUtils.js";
import { PSModel } from "./ParameterSystemController.js";
import { isSystemParameter, ParameterModel, SysParameterView, UParameterModel, UParameterView } from "./ParameterSystemTypes.js";

// Handles all ui stuff for the parameter system
export class ParameterSystemView {

    // Holds all form-views of the uparameters
    private userBindings: UParameterView[] = [];

    // Holds all form-views of the sysparameters
    private sysBindings: SysParameterView[] = [];

    // Base element to append all view elements to
    private tableBody: HTMLElement = null as any as HTMLElement;
    
    // Callback to execute when a paramter changes
    private onParameterChange: ()=>void = null as any as ()=>void;

    /**
     * Inits the view-system and binds all currently existing parameters to the page
     * 
     * @param tableBody the body to attach all visible elements to
     * @param onParameterChange callback to execute when a paramter changes
     */
    public bindToPage(tableBody: HTMLElement, onParameterChange: ()=>void){
        this.tableBody = tableBody;
        this.onParameterChange = onParameterChange;

        // Performs the first load (So not technically a reload)
        this.reloadViewFromModel(false);
    }

    /**
     * Completely clears the view and reloads every parameter from the model (Also the sys-parameters)
     * 
     * @param isReload if the loading is an actual reload or the first load (from inside)
     */
    public reloadViewFromModel(isReload=true){
        // Clears any previous stuff
        this.tableBody.innerHTML = "";
        this.sysBindings = [];
        this.userBindings = [];

        // Adds all already existing parameters to the view (User & System)
        [...PSModel.getSysParameters(),...PSModel.getUParameters()].forEach(this.loadParameterToForm.bind(this));

        // Appends the preview
        this.createAndAttachPreviewElement();
        this.checkForInvalidParameterNames();

        // Updates the system-parameters
        if(isReload)
            this.updateSystemParameters();
    }

    /**
     * Takes in a parameter and create a view for it
     * @param param the parameter to append to the document
     */
    private loadParameterToForm(param: ParameterModel){
        // Creates the form-bind
        var {body, nameInput, valueInput} = this.createParameterBody(param);

        // Adds eigther a system- or userparameter
        if(isSystemParameter(param)){
            // Creates a form-bind for the parameter
            var frmBindSys: SysParameterView = {
                name: param.name,
                valueInput: valueInput
            };

            // Appends the element to the page and adds the bind to the bind-stack
            this.tableBody.appendChild(body);
            this.sysBindings.push(frmBindSys);
        }else{
            // Creates a form-bind for the parameter
            var frmBind: UParameterView = {
                instanceId: param.instanceId,
                nameInput,
                valueInput,
                body
            }
    
            // Appends the element to the page and adds the bind to the bind-stack
            this.tableBody.appendChild(body);
            this.userBindings.push(frmBind);
        }

    }

    // Updates the preview of all system parameters (Must be called after the inital init got performed)
    public updateSystemParameters(){
        // Iterates over all sys-params
        for(var prm of PSModel.getSysParameters())
            // Gets the input-binding and appends the new value
            this.sysBindings.find(x=>x.name===prm.name)!.valueInput.value = prm.getter().toString();
    }






    /**
     * Optionally takes in an parameter @param param for which an html-tree will be created.
     * If no parameter is passed a preview will be created that is converted to a parameter
     * automatically once the user starts writing inside the name field.
     *
     * The method only creates the html-element and doesn't interact with the page or changes
     * states of any of the internal class objects
     * @returns the html-tree as body and the important fields inside an object
     */
    private createParameterBody(param?: ParameterModel){
        // Used to check which type of parameter is passed
        var isPreview = param === undefined;
        var isSys = !isPreview && isSystemParameter(param!);
        var isNormal = !isPreview && !isSys;

        // Creates the inputs (name and value)
        var valueInput =  C("input", {
            attr:{
                type:"text",
                placeholder: "...",
                value: isNormal ? (param as UParameterModel).value : "0",
                readonly: isSys ? "" : undefined
            },
            cls: "valueInp",
            evts:{
                "change": isNormal ? this.onChangeParamterValue.bind(this) : undefined,
                "input": isNormal ? this.onInputParameterValue.bind(this) : undefined
            }
        }) as HTMLInputElement;


        var nameInput = C("input", {
            attr:{
                type: "text",
                placeholder: "...",
                value: isPreview ? "" : param!.name,
                readonly: isSys ? "" : undefined
            },
            cls: "nameInp",
            evts: {
                "input": isPreview ? this.onPreviewInputVarName : (isNormal ? this.onInputParameterName.bind(this) : undefined),
                "change": isNormal ? this.onChangeParameterName.bind(this) : undefined
            }
        }) as HTMLInputElement;

        // Creates the body
        var body = C("tr",{
            attr: {
                "prm": isNormal ? (param as UParameterModel).instanceId.toString() : undefined
            },
            chld: [
                C("td",{chld: [
                    nameInput
                ]}),
                C("td", {chld:[
                   valueInput
                ]}),
                C("td",{chld:[
                    createIfElse(
                        ()=>C("i",{
                                cls: "fa fa-trash",
                                evts: {
                                    "click": this.onDeleteClicked.bind(this)
                                }
                            }
                        ),
                        ()=>C("i",{
                                cls: "infoIcon fa fa-info",
                                chld: [
                                    C("div", {
                                        cls: "popup",
                                        chld: [
                                            C("p", {
                                                text: "ui.parameter.description."+param!.name
                                            })
                                        ]
                                    })
                                ]
                            }
                        ),
                        !isSys
                    )
                ]})
            ],
            cls: `${printIf("preview",isPreview)}${printIf(" system",isSys)}`
        });

        return {
            body,
            nameInput,
            valueInput
        }
    }

    /**
     * Takes in the @param instanceId and deletes the view from the page.
     * This also sends a delete to the model to remove the parameter in generall. 
     */
    private deleteElement(instanceId: number){
        // Gets the bind
        var bind = this.userBindings.find(x=>x.instanceId === instanceId);

        // Ensures the bind got found
        if(bind === undefined)
            return;

        // Sends the delete to the parameter-system
        PSModel.deleteUParameter(bind.instanceId);

        // Removes the body from the document
        this.tableBody.removeChild(bind.body);

        // Removes the binding
        this.userBindings = this.userBindings.filter(bnd=>bnd.instanceId !== bind?.instanceId);

        // Validates duplicated names
        this.checkForInvalidParameterNames();

        // Executes the change callback
        this.onParameterChange();
    }

    /**
     * Creates a new preview-view and attaches it to the page
     */
    private createAndAttachPreviewElement(){
        this.tableBody.appendChild(this.createParameterBody().body);
    }

    /**
     * This is executes once the user has started writing inside the preview.
     * This takes the preview and converts it to an actual parameter with a parameter-view.
     * @param paramTableTr the outer most element of the parameter-html tree (Happens to be a table-tr element).
     */
    private convertPreviewToNormal(paramTableTr: HTMLElement){
        // Gets some required elements

        // Name input element
        var nameInp = (S(".nameInp",paramTableTr) as HTMLInputElement);

        // Value input element
        var valInp = (S(".valueInp",paramTableTr) as HTMLInputElement);


        // Creates the parameter
        var param = PSModel.createUserParameter(nameInp.value, parseFloat(valInp.value));

        // Creates the form-binding
        this.userBindings.push({
            instanceId: param.instanceId,
            nameInput: nameInp,
            valueInput: valInp,
            body: paramTableTr
        });



        // Updates the instance-id
        paramTableTr.setAttribute("prm",param.instanceId.toString());
        
        // Removes the preview class
        paramTableTr.classList.remove("preview");

        // Removes the preview-listener and appends the parameter listeners to the elements
        nameInp.removeEventListener("input", this.onPreviewInputVarName);
        nameInp.addEventListener("input", this.onInputParameterName.bind(this));
        nameInp.addEventListener("change", this.onChangeParameterName.bind(this));
        valInp.addEventListener("input", this.onInputParameterValue.bind(this));
        valInp.addEventListener("change", this.onChangeParamterValue.bind(this));

        // Ensures the onChange event fires once to update
        nameInp.blur();
        nameInp.focus();
    }

    // Takes in an event from the input-elements and returns it's id on the user-parameter-object
    private getInstanceIdFromEvt(evt: Event) : number{
        return parseFloat((evt.target! as HTMLInputElement).parentElement!.parentElement!.getAttribute("prm") as string);
    }

    // Starts checking the document for invalid/duplicated names and if any are found, the document get's updated
    private checkForInvalidParameterNames(){
        // Updates the duplicated names on the model
        PSModel.checkForErrors();

        // Gets the errors
        var errors = PSModel.getErrorParameters();

        // Updates the invalid-classes on the elements
        for(var bnd of this.userBindings){
            // Checks if the element is invalid
            var isInvalid = errors.find(err=>err.instanceId===bnd.instanceId) !== undefined;

            setClass(bnd.nameInput,"invalid",isInvalid);
        }
    }


    //#region Events

    // Event: Input only on the preview element (Converts into an actual variable)
    private onPreviewInputVarName=(evt: Event)=>{
        // Gets the wrapper-element
        var wrapper = (evt.target! as HTMLInputElement).parentElement!.parentElement!;

        // Converts the element to a normal element
        this.convertPreviewToNormal(wrapper);

        // Appends a new preview
        this.createAndAttachPreviewElement();

        // Validates duplicated names
        this.checkForInvalidParameterNames();
    }

    /**
     * Event: Change event for the parameter name (Once the user clicks outside the field or hits enter)
     * 
     * This is used to delete the paramter if the field is empty and to recompile the workspace
     */
    private onChangeParameterName(evt: Event){
        // Checks if the name is empty
        if((evt.target! as HTMLInputElement).value.trim().length <= 0){
            // Gets the instance-id
            var instanceId = this.getInstanceIdFromEvt(evt);
            
            // Delete the variable
            this.deleteElement(instanceId);
        }else
            // Executes the change callback
            this.onParameterChange();
    }

    // Event: Parameter-name update method
    private onInputParameterName(evt: Event){
        var instanceId = this.getInstanceIdFromEvt(evt);

        PSModel.updateName(instanceId, (evt.target! as HTMLInputElement).value);

        this.checkForInvalidParameterNames();
    }

    // Event: Parameter-value update method
    private onInputParameterValue(evt: Event){
        var instanceId = this.getInstanceIdFromEvt(evt);

        PSModel.updateValue(instanceId, parseFloat((evt.target! as HTMLInputElement).value));
    }

    // Event: Once the user clicks the delete icon
    private onDeleteClicked(evt: Event){
        // Gets the main element and deletes it
        this.deleteElement(this.getInstanceIdFromEvt(evt));       
    }

    // Event: When the parameters value really changes
    private onChangeParamterValue(evt: Event){
        // Executes the change callback
        this.onParameterChange();
    }
    
    //#endregion
}