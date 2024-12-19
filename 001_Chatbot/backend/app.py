from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os
from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# CORS für lokalen Entwicklungszweck erlauben
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],  # Frontend URL anpassen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisiere LangChain Chat Model
chat_model = ChatOpenAI(temperature=0, model_name="gpt-4")
memory = ConversationBufferMemory()
conversation = ConversationChain(llm=chat_model, memory=memory)

class MessageRequest(BaseModel):
    user_message: str

@app.post("/chat")
async def chat_endpoint(data: MessageRequest):
    user_input = data.user_message.strip()
    if not user_input:
        raise HTTPException(status_code=400, detail="Leere Eingabe ist nicht erlaubt.")
    
    try:
        # Hier wird die Konversation fortgeführt, LangChain kümmert sich um Kontext
        response = conversation.run(input=user_input)
        return {"assistant_message": response, "history": memory.load_memory_variables({})["history"]}
    except Exception as e:
        # Fehler abfangen und dem Frontend mitteilen
        return {"error": str(e), "assistant_message": "Entschuldigung, es ist ein Fehler aufgetreten."}
