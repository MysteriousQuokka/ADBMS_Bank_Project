from services.central_client import login, get_latest_model, send_update
from services.trainer import train_model
from services.s3_client import upload_model


def run():

    print("Bank node starting...")

    bank_id = login()

    print("Logged in as bank:", bank_id)

    model_info = get_latest_model()

    round_id = model_info.get("round_id")

    print("Training round:", round_id)

    model_path, samples = train_model()

    s3_path = upload_model(model_path)

    send_update(round_id, bank_id, s3_path, samples)

    print("Model update submitted")


if __name__ == "__main__":
    run()