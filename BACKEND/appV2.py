from flask import request, jsonify, session, Flask, make_response
from flask_bcrypt import Bcrypt
import jwt
import datetime
from utils.db import connect_to_mongodb
import logging
from utils.chat import Chat
from flask_cors import CORS
from models.user_model import User
from functools import wraps
import os
import logging
from dotenv import load_dotenv
import numpy as np

app = Flask(__name__)
CORS(app,origins=["http://localhost:3000"])
logging.basicConfig(level=logging.INFO)

bcrypt = Bcrypt(app)

#Loading API KEYS
load_dotenv()

# Connecting to varius apis
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET')
app.config['MONGO_URI'] = os.getenv('MONGO_URI')
app.config['GROQ_API_KEY'] = os.getenv('GROQ_API_KEY')

db = connect_to_mongodb(app.config["MONGO_URI"])
chat = Chat(app.config["GROQ_API_KEY"])
user = User(db)

# Existing routes...

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            print("Token is missing!")
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['JWT_SECRET'], algorithms=["HS256"])
            current_user = user.find_by_username(data['username'])
        except:
            print("Token is invalid!")
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/')
def home():
    return jsonify({'message': 'Welcome to the PDF CHAT-BOT API!'}), 200

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        user.add_new_user(data['username'], data['password'])
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'Error message': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    validated_user = user.validate_login(data['username'], data['password'])
    if validated_user:
        token = jwt.encode({
            'username': validated_user['username'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['JWT_SECRET'], algorithm="HS256")
        # response = make_response(jsonify({'message': 'Login successful!'}), 200)
        # response.set_cookie('token', token, httponly=True, max_age=24 * 60 * 60)
        # return response
        # Return the token in the response body
        return jsonify({'message': 'Login successful!', 'token': token}), 200
        
    return jsonify({'message': 'Invalid credentials'}), 401
    
@app.route('/logout', methods=['GET'])
def logout():
    session.pop('username', None)
    session.pop('chat_embeddings', None)
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/upload', methods=['POST'])
@token_required
def upload_pdf(current_user):
    try:
        if not os.path.exists("./uploads"):
            os.makedirs("./uploads")
        for file in request.files.getlist('files'):
            file.save(os.path.join("./uploads", file.filename))
        
        if os.listdir("./uploads"):
            
            embeddings = chat.vector_embedding()
            user.save_embeddings(current_user['username'], embeddings)
            # session['chat_embeddings'] = embeddings  # Save embeddings in session
            return jsonify({"message": "Vector Store DB is ready"}), 200
        else:
            return jsonify({"error": "Please upload PDFs first."}), 400
    except Exception as e:
        logging.error(f"Error during embedding: {e}")
        return jsonify({"error": "Failed to create embeddings."}), 500

@app.route('/query', methods=['POST', 'GET'])
@token_required
def query_documents(current_user):
    data = request.json
    prompt1 = data.get('query')
    if prompt1:
        # Retrieve embeddings
        try:
            embeddings_path = user.retrieve_emdedings_file_path(current_user['username'])
            if embeddings_path:
                embeddings = chat.load_embeddings(embeddings_path)
                if embeddings:
                    return chat.query(prompt1, embeddings)  # Pass embeddings to query
        except Exception as e:
            logging.error(f"Error during loading embeddings: {e}")
            return jsonify({"error": "Failed to load embeddings."}), 500
    return jsonify({"error": "Query not provided."}), 400


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False, port=5000)
