from pymongo import MongoClient

# Initialize the MongoDB client
client = MongoClient('mongodb+srv://admin:pass%40123@main.tleus.mongodb.net')

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