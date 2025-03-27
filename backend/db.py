import os
from pymongo import MongoClient
import dotenv

dotenv.load_dotenv('.env.local')

# Initialize the MongoDB client
client = MongoClient(os.getenv('MONGODB_URI'))

# Access the 'Crowd' database
db = client['Crowd']

# Access the 'Nodes' collection
nodesCollection = db['Nodes']

def getNodes():
    agg = [
        {
            '$lookup': {
                'from': 'Adjacents', 
                'localField': '_id', 
                'foreignField': 'from', 
                'as': 'adjacent', 
                'pipeline': [
                    {
                    '$project': {
                            'target': 1, 
                            'distance': 1,
                            '_id': 0
                        }
                    },
                ]
            }
        }
    ]

    return nodesCollection.aggregate(agg).to_list()