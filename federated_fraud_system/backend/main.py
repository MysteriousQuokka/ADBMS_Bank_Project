from fastapi import FastAPI

from database import Base, engine

from routers import auth
from routers import training
from routers import updates
from routers import audit


# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Federated Fraud Detection API")
app.include_router(audit.router)
app.include_router(auth.router)
app.include_router(training.router)
app.include_router(updates.router)


@app.get("/")
def root():
    return {"message": "Central Federated Learning Server Running"}