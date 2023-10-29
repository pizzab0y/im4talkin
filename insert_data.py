import os
import openai
from dotenv import find_dotenv, load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores.pgvector import PGVector
from langchain.document_loaders import DirectoryLoader, TextLoader

load_dotenv(find_dotenv())
openai.api_key = os.getenv("OPENAI_API_KEY")
PG_USERNAME = os.getenv("DB_USERNAME")
PG_PASSWORD = os.getenv("DB_PASSWORD")
PG_DB = os.getenv("DB_NAME")
PG_PORT = os.getenv("DB_PORT")

embeddings = OpenAIEmbeddings()
loader = DirectoryLoader(
    "./data/external/", glob="**/*.txt", loader_cls=TextLoader, show_progress=True
)
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

# PGVector needs the connection string to the database.
# CONNECTION_STRING = f"postgresql+psycopg2://admin:admin@127.0.0.1:5433/vectordb"
CONNECTION_STRING = f"postgresql+psycopg2://{PG_USERNAME}:{PG_PASSWORD}@0.0.0.0:5433/{PG_DB}"


COLLECTION_NAME = "vectordb"


PGVector.from_documents(
    docs,
    embeddings,
    collection_name=COLLECTION_NAME,
    connection_string=CONNECTION_STRING
)
