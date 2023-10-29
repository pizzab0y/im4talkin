from typing import List
from fastapi import FastAPI
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

ROLE_CLASS_MAP = {"assistant": AIMessage, "user": HumanMessage, "system": SystemMessage}

load_dotenv(find_dotenv())
openai.api_key = os.getenv("OPENAI_API_KEY")
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


embeddings = OpenAIEmbeddings()
chat = ChatOpenAI(temperature=0)
store = PGVector(
    collection_name=COLLECTION_NAME,
    connection_string=CONNECTION_STRING,
    embedding_function=embeddings,
)
retriever = store.as_retriever()

prompt_template = """As a user's friendly mate, you have the following information about them:

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


@app.post("/service3/{conversation_id}")
async def service3(conversation_id: str, conversation: Conversation):
    query = conversation.conversation[-1].content

    docs = retriever.get_relevant_documents(query=query)
    # docs = format_docs(docs=docs)

    prompt = system_message_prompt.format(context=docs)
    print("BITCH")
    print(prompt)
    print("FUCK")
    messages = [prompt] + create_messages(conversation=conversation.conversation)
    print(messages)

    result = chat(messages)

    return {"id": conversation_id, "reply": result.content}
