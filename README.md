🇬🇧 🇬🇧 🇬🇧 🇬🇧 🇬🇧 🇬🇧 🇬🇧

Get ready for a moonshot journey as we work here on crafting an AI buddy to enhance your English skills. Let's reach for the stars together!

🇬🇧 🇬🇧 🇬🇧 🇬🇧 🇬🇧 🇬🇧 🇬🇧

==============================

## Services

The project consists of the following services:

1. **Frontend:** A React application that provides the user interface for interacting with the AI buddy.

2. **Postgres:** A Postgres server acting as a main database for storing users information in accordance with ACID and, it's still up in the air, probably as a database for storing vector embeddings via pgvector.

3. **Service2:** A Python (FastAPI)-based backend that coordinates the communication between the frontend and Service3. This service also manages the interaction history between the user and the chatbot.

4. **Service3:** Another Python (FastAPI)-based backend hosting the chatbot algorithm. This service communicates with the AI engine (OpenAI GPT-3.5-turbo/GPT-4 in the first stage of the project and something open-source in the next one) to process user queries and generate suitable responses.

5. **Redis:** A Redis server used for state storage across the services.


## Setup

To get the project up and running, make sure Docker is installed on your system.

Then, run the following command:

```bash
docker-compose up
```

This command starts all services using the `docker-compose.yml` file. It downloads the necessary Docker images, creates associated containers, and gets them running together.

## Env Variable

Rename the .env.example to .env and set your OpenAI API Key.

## Data Population
The provided insert_data.py script can be used to populate the Postgres database with your (currently mine) data. To do this, run the script once the services are up and running. It will connect to the Postgres service, create the necessary tables, and insert data into them.

Project Organization
------------

    ├── LICENSE
    ├── Makefile            <- Makefile with commands like `make data` or `make train`
    ├── README.md           <- The top-level README for developers using this project.
    ├── data
    │   ├── external        <- Data from third party sources.
    │   ├── interim         <- Intermediate data that has been transformed.
    │   ├── processed       <- The final, canonical data sets for modeling.
    │   └── raw             <- The original, immutable data dump.
    │
    ├── docs                <- A default Sphinx project; see sphinx-doc.org for details
    │
    ├── models              <- Trained and serialized models, model predictions, or model summaries
    │
    ├── notebooks           <- Jupyter notebooks. Naming convention is a number (for ordering),
    │                          the creator's initials, and a short `-` delimited description, e.g.
    │                          `1.0-jqp-initial-data-exploration`.
    │
    ├── references          <- Data dictionaries, manuals, and all other explanatory materials.
    │
    ├── reports             <- Generated analysis as HTML, PDF, LaTeX, etc.
    │   └── figures         <- Generated graphics and figures to be used in reporting
    │
    ├── requirements.txt    <- The requirements file for reproducing the analysis environment, e.g.
    │                          generated with `pip freeze > requirements.txt`
    │
    ├── .env.example        <- A dotenv file template that stores all the credentials and API
    │                         keys in one place; needs to be renamed to .env
    │
    ├── docker-compose.yaml <- Defines and runs our multicontainer Docker application
    │
    ├── insert_data.py      <- Settles the Postgres database with your data
    │
    ├── setup.py            <- Makes project pip installable (pip install -e .) so src can be imported
    ├── src                 <- Source code for use in this project.
    │   ├── __init__.py     <- Makes src a Python module
    │   │
    │   ├── data            <- Scripts to download or generate data
    │   │   └── make_dataset.py
    │   │
    │   ├── features        <- Scripts to turn raw data into features for modeling
    │   │   └── build_features.py
    │   │
    │   ├── models          <- Scripts to train models and then use trained models to make
    │   │   │                  predictions
    │   │   ├── predict_model.py
    │   │   └── train_model.py
    │   │
    │   └── visualization   <- Scripts to create exploratory and results oriented visualizations
    │       └── visualize.py
    │
    └── tox.ini             <- tox file with settings for running tox; see tox.readthedocs.io
