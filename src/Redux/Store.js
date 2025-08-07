import { createStore,combineReducers } from "redux";
import { applyMiddleware } from "redux";
import  {thunk}  from "redux-thunk";

import InputReducer from "./Reducers/InputReducers";
import ResultReducers from "./Reducers/ResultReducers";
import CorrectionResultReducers from "./Reducers/CorrectionResultReducers";

let combineStore=combineReducers({inputReducer:InputReducer,resultReducer:ResultReducers, correctionResultReducer:CorrectionResultReducers})
let store=createStore(combineStore,{},applyMiddleware(thunk))

export default store