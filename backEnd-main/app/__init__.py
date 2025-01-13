from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from .config import Config
from werkzeug.security import generate_password_hash, check_password_hash  # Updated hashing method



# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()


def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app, resources={r"/*": {"origins": "*"}}, 
         methods=["GET", "POST", "DELETE", "PUT", "OPTIONS"])

    # Load configurations
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)


    # Import and register routes
    from app.routes import routes  # Use a relative import to get the routes
    app.register_blueprint(routes)  # Register the blueprint


    return app
    