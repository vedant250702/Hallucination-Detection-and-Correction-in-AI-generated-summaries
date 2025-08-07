from fastapi.routing import APIRouter
from pydantic import BaseModel
from Pipeline.HallucinationPipeline import HallucinationPipeline
from Pipeline.CorrectionLLMs import DeepseekAPI
from nltk.tokenize import sent_tokenize
from utils import detectionProcess
import os





router=APIRouter(prefix="/api")
pipeline=HallucinationPipeline("./Models/Roberta-base-5k-epoch2","cpu")
deepseek=DeepseekAPI(api_key=deepseek_apikey)

# {'predictions': [0],
#  'corrected_summary': [],
#  'sent_predicted': [array([2, 0, 0, 0])],
#  'factual_score': [0.21776947937905788],
#  'contradiction_score': [0.7815729230642319]}



# Detection Endpoint
class DetectionRequest(BaseModel):
    article:str
    summary:str

@router.post("/detect")
def detect(data:DetectionRequest):
    article=data.article.strip().replace("\n","").replace("\t"," ")
    summary=data.summary.strip().replace("\n","").replace("\t"," ")
    result=detectionProcess(article=article,summary=summary,pipeline=pipeline)
    result["status"]=200
    return result



#  Correction Endpoint
class correctionRequest(BaseModel):
    article:str
    tag_summary:str
    model:str

@router.post("/correct")
def correct(data:correctionRequest):
    try:
        
        if data.model=="mistral":
            pass
        elif data.model=="gemini":
            pass
        elif data.model=="deepseek":
            correction=deepseek.correct(premise=data.article, summary=data.tag_summary)
        
        print(correction)

        result=detectionProcess(article=data.article,summary=correction,pipeline=pipeline)
        result["corrected_summary"]=correction
        result["status"]=200
        return result
    except Exception as e:
        print(e)
        return {"status":404}
    









# @router.post("/detect")
# def detect(data:DetectionRequest):
    # article=data.article.strip().replace("\n","").replace("\t"," ")
    # summary=data.summary.strip().replace("\n","").replace("\t"," ")

#     result=pipeline.process([[article,summary]],correct_the_summary=False)
#     all_sentences=sent_tokenize(summary)
#     print(result)
#     summary=pipeline.addTags(all_sentences,result["sent_predicted"][0],len(all_sentences))
#     score=str(result["factual_score"][0])
#     sentenceLabels=list(result["sent_predicted"][0])
#     labelCounts=[sentenceLabels.count(0),sentenceLabels.count(2)]
  
#     prompt=f"""
# Here is a summary with hallucinated parts marked using <xx> tags.

# Please correct only the text inside the <xx> tags to make it factually accurate based on the original article. Leave the rest of the summary unchanged and remove the <xx> tags after correction.

# Return the summary with hallucinated parts fixed and you can remove those <xx></xx> tags. Don't remove that entire sentence.
            
# Original Article:
#     {data.article}

# Summary:
#     {summary}

# """
    # return {"summary":summary,"score":score,"counts":labelCounts,"copy_prompt":prompt}