from fastapi import FastAPI

from database import Base, engine

from routers import auth
from routers import training
from routers import updates
from routers import audit
from models import bank_model
from models import user_model
from models import model_registry
from models import training_round_model
from models import model_update_model
from models import audit_log_model

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