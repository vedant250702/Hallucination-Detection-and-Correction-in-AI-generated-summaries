from transformers import AutoTokenizer,AutoModelForSequenceClassification
import torch.nn.functional as F
import numpy as np
import pandas as pd
from nltk.tokenize import sent_tokenize
import torch
import requests



class HallucinationPipeline:
    def __init__(self,nli_model_name,device,llm_model=None):
        # NLI Models Setting
        self.tokenizer=AutoTokenizer.from_pretrained(nli_model_name)
        self.nli_model=AutoModelForSequenceClassification.from_pretrained(nli_model_name).to(device)
        self.labels=["CONTRADICTION","NEUTRAL","ENTAILMENT"]
        self.device=device

        # Correction models
        self.llm=llm_model

        # Storing the results of the predicted models
        self.detection_predicted_labels=[]
        self.detection_predicted_labels_after_correction=[]
        self.corrected_summary=[]



    # -------------------------------------------------------------
    # | FUNCTION 1 :  Detecting the hallucinated parts using NLI. |
    # -------------------------------------------------------------
    def Detection(self,premise,hypothesis):
        inputs=self.tokenizer(premise,hypothesis,return_tensors="pt",truncation=True,padding=True)
        inputs = {key: val.to(self.device) for key, val in inputs.items()}

        with torch.no_grad():
            logit=self.nli_model(**inputs).logits
            prob=F.softmax(logit,dim=-1)
        prediction=torch.argmax(prob,dim=-1)
        entailment_score=prob[:,2]
        contra_score=prob[:,0]
        # print("Logits : ",logit)
        # print("Probability : \n",prob)
        # print("Label : ",[self.labels[i] for i in prediction])
        # print("\n")
        # return prediction.tolist()
        return prediction.cpu().tolist(),entailment_score.cpu().tolist(), contra_score.cpu().tolist()
    


    # ----------------------------------------------------------------------
    # | FUNCTION 2 : This involves using the LLM to correct the summaries. |
    # ----------------------------------------------------------------------
    def Correction(self,premise,prompt):
        correction=self.llm.correct(premise,prompt)
        return correction


    # ---------------------------------------------------------------------------
    # | FUNCTION 3 : This involves adding the Tag to the summary  <xx>...</xx>  |
    # ---------------------------------------------------------------------------
    def addTags(self,sentences_list,sent_predicted_labels,size):
        for i in range(size):
            if sent_predicted_labels[i]==0:
                sentences_list[i]=f"<xx> {sentences_list[i]} </xx>"

        prompt_ready_summary=" ".join(sentences_list)
        return prompt_ready_summary


    #  ------------------------------------------------------------------------------------------------------
    #  | FUNCTION 4 : This function helps to chunk the article, because max token for base nli model is 256.| 
    #  ------------------------------------------------------------------------------------------------------
    def chunk_article(self,article,chunk_size=240,stride=128):
        input_ids=self.tokenizer.encode(article)
        chunks=[]
        for i in range(0,len(input_ids),stride):
            new_token=input_ids[i:i+chunk_size]
            decoded_article=self.tokenizer.decode(new_token)
            chunks.append(decoded_article)
        return chunks


    #  --------------------------------------------------
    #  | FUNCTION 5 : Integrated all the above methods. |
    #  --------------------------------------------------
    # Input : DataFrame(Premise, Hypothesis, labels[Optional])
    def process(self,df,correct_the_summary=False):

        # Empty previous outputs.
        self.detection_predicted_labels=[]
        self.detection_predicted_labels_after_correction=[]
        self.corrected_summary=[]
        sentence_predicted_labels=[]
        summary_factual_score=[]
        summary_contradiction_score=[]
        count=1
 

        # Starting the Pipeline of Detection and Correction
        for premise,hypo in np.array(df):

        # | Step 1 |: Splitting and detecting each sentence.
            splitting_sentences= sent_tokenize(hypo)
            size_of_sentence=len(splitting_sentences)
            chunks=self.chunk_article(premise,chunk_size=384,stride=256)
            chunk_sent_pred=[]
            chunk_sent_score=[]
            chunk_contra_score=[]

            for article_part in chunks:
                premises=[article_part]*size_of_sentence
                sent_predicted_labels,sent_predicted_scores, sent_contra_scores= self.Detection(premises, splitting_sentences)
                chunk_sent_pred.append(sent_predicted_labels)
                chunk_sent_score.append(sent_predicted_scores)
                chunk_contra_score.append(sent_contra_scores)

            chunk_sent_pred=np.stack(chunk_sent_pred,axis=1)
            chunk_sent_score=np.stack(chunk_sent_score,axis=1)
            chunk_contra_score=np.stack(chunk_contra_score,axis=1)

            # print("Your all sentences for the article : \n",chunk_sent_pred)
            sent_predicted_labels=np.max(chunk_sent_pred,axis=1)
            factual_score=np.mean(np.max(chunk_sent_score,axis=1))
            contra_score=np.mean(np.min(chunk_contra_score,axis=1))

            summary_factual_score.append(factual_score)
            summary_contradiction_score.append(contra_score)
            # print("Your sentences prediction : \n",sent_predicted_labels)
            # Label whether summary is factually correct or not

            SummaryPrediction=0 if 0 in sent_predicted_labels else 2
            sentence_predicted_labels.append(sent_predicted_labels)

            # if factual_score<0.85 and SummaryPrediction==2:
            #     SummaryPrediction=1


            self.detection_predicted_labels.append(int(SummaryPrediction))

        # | Step 2 |: Correction of the Summary using LLMs, if parameter correct_the_summary=True.
            if correct_the_summary:
                if SummaryPrediction<=1:
                    prompt=self.addTags(splitting_sentences,sent_predicted_labels,size_of_sentence)
                    corrected_result=self.Correction(premise,prompt)
                    self.corrected_summary.append(corrected_result)
                else:
                    self.corrected_summary.append(None)

            print("Detected : ",count)
            count+=1
            
        output={
                "predictions":self.detection_predicted_labels,
                "corrected_summary":self.corrected_summary,
                "sent_predicted":sentence_predicted_labels,
                "factual_score":summary_factual_score,
                "contradiction_score":summary_contradiction_score
                }
        return output
    



    #  ---------------------------------------------------------
    #  | Optional FUNCTION : Integrated all the above methods. |
    #  ---------------------------------------------------------
    def fetchData(self,url,depth=[],articleFieldName=None,summaryFieldName=None,limit=None):
        try:
            data=requests.get(url)
            data=data.json()
            article=[]
            summary=[]
            count=limit

            for field in depth:
                data=data[field]

            if type(data)!=list:
                data=[data]
            
            for index,i in enumerate(data):
                print("Index : ",index)

                if i.get(articleFieldName):
                    article.append(str(i[articleFieldName]))
                    if summaryFieldName and i[summaryFieldName]:
                        summary.append(str(i[summaryFieldName]))
                    else:
                        #Create Summary and append
                        result=self.llm.create(str(i[articleFieldName]))
                        summary.append(result)
                if count:
                    count-=1
                    if count<1:
                        break
            
            # Detection and getting Factual Score.
            data=np.column_stack([article,summary])
            result=self.process(data,correct_the_summary=False)
            data=np.column_stack([data,result["predictions"],result["factual_score"]])

            df=pd.DataFrame(data,columns=["Article","Summary","Prediction","Factuality"])
            return df
    
        except Exception as e:
            print("Failed to fetch data:", e)
            return None
        