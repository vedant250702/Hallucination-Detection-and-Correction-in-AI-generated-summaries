let initialState={article:"",summary:""}

const InputReducer=(state=initialState,action)=>{
    switch (action.type) {
        case "article":
            state={...state,article:action.payload}
            return state
    
        case "summary":
            state={...state,summary:action.payload}
            return state

        default:
            return state
    }
}

export default InputReducer;