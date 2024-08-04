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
prompt = ChatPromptTemplate.from_template(
    """
    You are a chat bot.
    Answer the questions taking reference from the context provided.
    Please provide the most accurate response based on the question.
    If you dont know the answer, just say that you dont know.
    <context>
    {context}
    <context>
    Questions: {input}
    """
)

class Chat():
    def __init__(self,groq_api_key):
        self.embeddingsModel = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        if not groq_api_key:
            logging.error("GROQ_API_KEY environment variable not set.")
        self.llm = ChatGroq(groq_api_key=groq_api_key, model_name="Llama3-8b-8192")
    def vector_embedding(self):
        try:
            logging.info("Starting vector embedding")
            loader = PyPDFDirectoryLoader("./uploads")
            docs = loader.load()
            logging.info(f"Loaded {len(docs)} documents")
            final_documents = self.text_splitter.split_documents(docs[:20])
            vectors = FAISS.from_documents(final_documents, self.embeddingsModel)
            logging.info("Vector embeddings created successfully")
            return vectors
        except Exception as e:
            logging.error(f"Error during vector embedding: {e}")

    def load_embeddings(self,file_path):
        try:
            vectors = FAISS.load_local(file_path, self.embeddingsModel, allow_dangerous_deserialization=True)
            logging.info("Embeddings loaded successfully")
            return vectors
        except Exception as e:
            logging.error(f"Error during embedding: {e}")

    def query(self,prompt1,vectors):
        if prompt1:
            logging.debug(f"Received query: {prompt1}")
            document_chain = create_stuff_documents_chain(self.llm, prompt)
            if vectors:
                retriever = vectors.as_retriever()
                retrieval_chain = create_retrieval_chain(retriever, document_chain)
                start = time.process_time()
                response = retrieval_chain.invoke({'input': prompt1})
                elapsed_time = time.process_time() - start
                logging.debug(f"Response: {response}")
                return {"response_time": elapsed_time, "answer": response['answer']}
            else:
                return {"error": "Please initialize document embeddings first."}, 400

        
    
