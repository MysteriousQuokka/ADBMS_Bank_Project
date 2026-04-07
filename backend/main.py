from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import Base, engine

from backend.routers import auth
# from backend.routers import training
from backend.routers import updates
from backend.routers import audit
from backend.models import bank_model1
from backend.models import user_model
# from backend.models import model_registry
from backend.models import training_round_model1
# from backend.models import model_update_model
from backend.models import audit_log_model   

# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Federated Fraud Detection API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://adbms-bank-project-hq5g.vercel.app"  # add later when deployed
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(audit.router)
app.include_router(auth.router)
# app.include_router(training.router)
app.include_router(updates.router)


@app.get("/")
def root():
    return {"message": "Central Federated Learning Server Running"}