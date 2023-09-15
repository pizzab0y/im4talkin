from pydub import AudioSegment
from google.cloud import storage

app = FastAPI()
#storage_client = storage.Client()
#bucket = storage_client.get_bucket(im4talkin-bucket)
#files = bucket.list_blobs(prefix=bucketFolder)

@app.get("/hello")
def hello():
    return {"message": "Buenos diaz!"}
