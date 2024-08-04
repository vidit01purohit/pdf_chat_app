from flask_bcrypt import generate_password_hash, check_password_hash
import os
import faiss
class User:
    def __init__(self, db):
        self.db = db

    def add_new_user(self, username, password):
        if self.find_by_username(username):
            raise Exception('Username already exists')
        else:
            hashed_password = generate_password_hash(password).decode('utf-8')
            self.db.users.insert_one({
                'username': username,
                'password': hashed_password
            })

    def save_embeddings(self, username, embeddings,):
        user_directory = os.path.join("embeddings", f"{username}_index")
        if not os.path.exists(user_directory):
            os.makedirs(user_directory)
        embeddings.save_local(user_directory)
        self.db.users.update_one({'username': username}, {'$set': {'embeddings_file_path': user_directory}})

    def retrieve_emdedings_file_path(self, username):
        user = self.db.users.find_one({'username': username})
        if user:
            embeddings_file_path = user['embeddings_file_path']
            return embeddings_file_path
        
    def find_by_username(self,username):
        return self.db.users.find_one({'username': username})

    def validate_login(self, username, password):
        user = self.find_by_username(username)
        if user and check_password_hash(user['password'], password):
            return user
        return None
