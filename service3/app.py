from typing import List
from fastapi import FastAPI, Response
from pydantic import BaseModel
import os
from fastapi.middleware.cors import CORSMiddleware
import openai
from langchain.prompts import PromptTemplate
import logging
from dotenv import find_dotenv, load_dotenv
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores.pgvector import PGVector
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores.pgvector import PGVector
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.prompts import PromptTemplate, SystemMessagePromptTemplate

import requests
# import pyaudio
import soundfile as sf
import io
# import time
# from pydub import AudioSegment
# from pydub.playback import play
# import pydub

from pathlib import Path

ROLE_CLASS_MAP = {"assistant": AIMessage, "user": HumanMessage, "system": SystemMessage}

load_dotenv(find_dotenv())
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY
PG_USERNAME = os.getenv("DB_USERNAME")
PG_PASSWORD = os.getenv("DB_PASSWORD")
PG_DB = os.getenv("DB_NAME")
PG_PORT = os.getenv("DB_PORT")


# CONNECTION_STRING = "postgresql+psycopg2://admin:admin@postgres:5432/vectordb"
CONNECTION_STRING = (
    f"postgresql+psycopg2://{PG_USERNAME}:{PG_PASSWORD}@postgres:{PG_PORT}/{PG_DB}"
)
COLLECTION_NAME = "vectordb"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Message(BaseModel):
    role: str
    content: str


class Conversation(BaseModel):
    conversation: List[Message]
    
    
class Tts(BaseModel):
    model: str = "tts-1"
    voice: str = "alloy"
    response_format: str = "opus"
    input_text: str


embeddings = OpenAIEmbeddings()
chat = ChatOpenAI(
    # model="gpt-4",
    temperature=0
)
store = PGVector(
    collection_name=COLLECTION_NAME,
    connection_string=CONNECTION_STRING,
    embedding_function=embeddings,
)
retriever = store.as_retriever()

prompt_template = """As a user's friendly mate named Marcel, you have the following information about them:

{context}

Please provide the most suitable response for the user.
Answer:"""

prompt = PromptTemplate(template=prompt_template, input_variables=["context"])
system_message_prompt = SystemMessagePromptTemplate(prompt=prompt)


def create_messages(conversation):
    return [
        ROLE_CLASS_MAP[message.role](content=message.content)
        for message in conversation
    ]


def format_docs(docs):
    formatted_docs = []
    for doc in docs:
        formatted_doc = "Source: " + doc.metadata["source"]
        formatted_docs.append(formatted_doc)
    return "\n".join(formatted_docs)


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/service3audio/")
async def service3audio(tts: Tts):
    # OpenAI API endpoint and parameters
    url = "https://api.openai.com/v1/audio/speech"
    headers = {
        "Authorization": f'Bearer {OPENAI_API_KEY}',
        "Content-Type": "application/json"
    }

    data = {
        "model": tts.model,
        "input": tts.input_text,
        "voice": tts.voice,
        "response_format": tts.response_format
    }
    
    with requests.post(url, headers=headers, json=data, stream=False) as resp:
        if resp.status_code == 200:
            print("testify")
            print(resp.status_code)
            # print(resp.encoding)
            # print(resp.content)
            # print(resp.raw)
            print("end_of_testify")
            
            response = Response(
                    content=resp.content,
                    media_type="audio/ogg",
                    headers={"Content-Type": "audio/ogg"},
                )
                
            return response
        
        #     buffer = io.BytesIO()
        #     for chunk in response.iter_content(chunk_size=4096):
        #         buffer.write(chunk)
            
        #     buffer.seek(0)

            # with sf.SoundFile(resp.content, 'r') as sound_file:
            #     format = sound_file.format
            #     channels = sound_file.channels
            #     rate = sound_file.samplerate
                
            #     response = Response(
            #         content=sound_file,
            #         media_type="audio/ogg",
            #         headers={"Content-Disposition": "attachment;filename=audiotrack.ogg"},
            #     )
                
            #     return response

                # stream = audio.open(format=format, channels=channels, rate=rate, output=True)
                # chunk_size = 1024
                # data = sound_file.read(chunk_size, dtype='int16')
                # print(f"Time to play: {time.time() - start_time} seconds")

                # while len(data) > 0:
                #     stream.write(data.tobytes())
                #     data = sound_file.read(chunk_size, dtype='int16')

                # stream.stop_stream()
                # stream.close()
        else:
            print(f"Error: {resp.status_code} - {resp.text}")
            response = Response(
                content="You're a wuss!",
                media_type="text/html",
                # headers={"Content-Disposition": "attachment;filename=audiotrack.ogg"},
            )
                            
            return response
    
    # speech_file_path = Path(__file__).parent / "speech.ogg"

    # response = openai.audio.speech.create(
    #     model=tts.model,
    #     voice=tts.voice,
    #     response_format=tts.response_format,
    #     input=tts.inputText
    # )

    # response.stream_to_file(speech_file_path)
    
    response = Response(
        content="regular_content",
        media_type="audio/ogg",
        headers={"Content-Disposition": "attachment;filename=audiotrack.ogg"},
    )
    
    return response


@app.post("/service3/{conversation_id}")
async def service3(conversation_id: str, conversation: Conversation):
    query = conversation.conversation[-1].content

    docs = retriever.get_relevant_documents(query=query)
    # docs = format_docs(docs=docs)

    prompt = system_message_prompt.format(context=docs)
    print("PITCH")
    print(prompt)
    print("DUCK")
    messages = [prompt] + create_messages(conversation=conversation.conversation)
    print(messages)

    result = chat(messages)
    
    return {"id": conversation_id, "reply": result.content}
