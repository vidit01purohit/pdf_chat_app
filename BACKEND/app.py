from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import shutil
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFDirectoryLoader
from dotenv import load_dotenv
import time
import logging

app = Flask(__name__)
load_dotenv()
CORS(app)
logging.basicConfig(level=logging.INFO)

groq_api_key = os.getenv('GROQ_API_KEY')
if not groq_api_key:
    logging.error("GROQ_API_KEY environment variable not set.")
llm = ChatGroq(groq_api_key=groq_api_key, model_name="Llama3-8b-8192")

prompt = ChatPromptTemplate.from_template(
    """
    Answer the questions based on the provided context only.
    Please provide the most accurate response based on the question
    <context>
    {context}
    <context>
    Questions: {input}
    """
)

def vector_embedding():
    global vectors, docs, text_splitter, final_documents, embeddings
    try:
        logging.info("Starting vector embedding")
        loader = PyPDFDirectoryLoader("./uploads")
        docs = loader.load()
        logging.info(f"Loaded {len(docs)} documents")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        final_documents = text_splitter.split_documents(docs[:20])
        embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
        vectors = FAISS.from_documents(final_documents, embeddings)
        logging.info("Vector embeddings created successfully")
    except Exception as e:
        logging.error(f"Error during vector embedding: {e}")

@app.route('/upload', methods=['POST'])
def upload_pdfs():
    try:
        if not os.path.exists("./uploads"):
            os.makedirs("./uploads")
        for file in request.files.getlist('files'):
            file.save(os.path.join("./uploads", file.filename))
        return jsonify({"message": "PDFs uploaded successfully!"})
    except Exception as e:
        logging.error(f"Error uploading PDFs: {e}")
        return jsonify({"error": "Failed to upload PDFs."}), 500

@app.route('/embed', methods=['POST'])
def embed_documents():
    try:
        if os.path.exists("./uploads") and os.listdir("./uploads"):
            vector_embedding()
            return jsonify({"message": "Vector Store DB is ready"})
        else:
            return jsonify({"error": "Please upload PDFs first."}), 400
    except Exception as e:
        logging.error(f"Error during embedding: {e}")
        return jsonify({"error": "Failed to create embeddings."}), 500
import json

@app.route('/query', methods=['POST'])
def query_documents():
    try:
        data = request.json
        prompt1 = data.get('query')

        if prompt1:
            logging.debug(f"Received query: {prompt1}")
            document_chain = create_stuff_documents_chain(llm, prompt)
            if 'vectors' in globals():
                retriever = vectors.as_retriever()
                retrieval_chain = create_retrieval_chain(retriever, document_chain)
                start = time.process_time()
                response = retrieval_chain.invoke({'input': prompt1})
                elapsed_time = time.process_time() - start
                logging.debug(f"Response: {response}")

                return jsonify({
                    "response_time": elapsed_time,
                    "answer": response['answer'],
                })
            else:
                return jsonify({"error": "Please initialize document embeddings first."}), 400

        return jsonify({"error": "Query not provided."}), 400
    except Exception as e:
        logging.error(f"Error during querying: {e}")
        return jsonify({"error": str(e)}), 500

# @app.route('/delete', methods=['POST'])
# def delete_uploaded_pdfs():
#     try:
#         folder = "./uploads"
#         for filename in os.listdir(folder):
#             file_path = os.path.join(folder, filename)
#             try:
#                 if os.path.isfile(file_path) or os.path.islink(file_path):
#                     os.unlink(file_path)
#                 elif os.path.isdir(file_path):
#                     shutil.rmtree(file_path)
#             except Exception as e:
#                 logging.error(f"Failed to delete {file_path}. Reason: {e}")
#         return jsonify({"message": "Uploaded PDFs deleted successfully!"})
#     except Exception as e:
#         logging.error(f"Error during deletion: {e}")
#         return jsonify({"error": "Failed to delete PDFs."}), 500

@app.route('/reset', methods=['POST'])
def reset():
    try:
        # Path to the directory where PDFs are stored
        pdf_directory = 'uploads'
        # Clear the directory
        shutil.rmtree(pdf_directory)
        os.makedirs(pdf_directory)
        vectors, docs, text_splitter, final_documents, embeddings = None, None, None, None, None
        return jsonify({"message": "Chat reset and PDFs deleted"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
