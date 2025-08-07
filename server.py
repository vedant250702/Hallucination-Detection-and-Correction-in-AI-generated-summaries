from fastapi import FastAPI
import uvicorn
from Routes import router
from fastapi.middleware.cors import CORSMiddleware


app=FastAPI()
app.include_router(router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_credentials=True)

@app.get("/")
def main():
    return {"message":"Hello World"}


# if __name__=="__main__":
#     uvicorn.run(app=app,host="127.0.0.1",port=5000) 