import { ParameterSystemModel } from "./ParameterSystemModel.js";
import { ParameterSystemView } from "./ParameterSystemView.js";

// The model contains the truth state of all parameters.
// It is used as the backend to grab and store data to and
// can also independently from anything else detect all errors with the
// parameters (Duplicate names, invalid names or invalid values)
// It doesn't interact with anything else.
export const PSModel = new ParameterSystemModel();

// Uses the PSModel as its data-backend and acts as a layer
// between the model and the user. This is basically the frontend.
// It actively interacts with the PSModel to create, change or delete
// parameters and present these to the user
export const PSView = new ParameterSystemView();