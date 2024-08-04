from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

def connect_to_mongodb(mongo_uri):
    client = MongoClient(mongo_uri, server_api=ServerApi('1'))
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
        db = client.users
        return db
    except Exception as e:
        print(e)
    return "Error connecting to MongoDB", 500