from flask import Flask
from app.extensions import db
from app.config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Init extensions
    db.init_app(app)

    # 🔥 FORCE MODEL REGISTRATION
    import app.models  # DO NOT REMOVE

    return app
