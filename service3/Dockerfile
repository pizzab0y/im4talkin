FROM python:3.9-slim-buster

WORKDIR /app

COPY . /app

# RUN apt-get update && apt-get install gcc ffmpeg python3-all-dev portaudio19-dev -y

RUN pip install --no-cache-dir fastapi uvicorn redis requests "openai<1.0.0" langchain python-dotenv postgres psycopg2-binary pgvector tiktoken requests soundfile
# requests soundfile pydub pyaudio

# install postgresql client
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy wait-for-postgres.sh and make it executable
COPY ./wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

EXPOSE 80

CMD ["/wait-for-postgres.sh", "postgres", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "80", "--reload"]
