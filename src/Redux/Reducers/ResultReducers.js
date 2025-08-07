let initialState={score:0,prompt:"",tag_summary:"",sentence_count:[],model:"deepseek"}

let ResultReducers=(state=initialState,action)=>{
    switch (action.type) {
        case "score":
            state={...state,score:action.payload}
            return state
        case "prompt":
            state={...state,prompt:action.payload}
            return state
        case "tag_summary":
            state={...state,tag_summary:action.payload}
            return state
        case "sentence_count":
            state={...state,sentence_count:action.payload}
            return state
        case "model":
            state={...state,model:action.payload}
            return state
        
        default:
            return state
    }
}

export default ResultReducers;