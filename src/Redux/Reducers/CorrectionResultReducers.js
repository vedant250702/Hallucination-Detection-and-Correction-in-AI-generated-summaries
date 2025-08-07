let initialState={score:0,sentence_count:[], corrected_summary:""}

const CorrectionResultReducers=(state=initialState,action)=>{
    switch (action.type) {
        case "corrected_score":
            state={...state,score:action.payload}
            return state
        // case "tag_summary":
        //     state={...state,tag_summary:action.payload}
        //     return state
        case "corrected_sentence_count":
            state={...state,sentence_count:action.payload}
            return state
        case "corrected_summary":
            state={...state,corrected_summary:action.payload}
            return state
        
        case "clear_correct_summary_parameters":
            state={score:0,sentence_count:[], corrected_summary:""}
            return state
        default:
            return state
        }
}

export default CorrectionResultReducers