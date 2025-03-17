"use server"

import { ObjectId, UpdateResult, WithId } from "mongodb";
import { adjNodesCollection, nodesCollection } from "./db";
import { Adjacent, AggCamNode, CamNode, WithStringId } from "./types";

export async function getAllNodes(lite: boolean = false) {
    const agg = [
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
                    }, {
                        '$lookup': {
                            'from': 'Nodes', 
                            'localField': 'target', 
                            'foreignField': '_id', 
                            'as': 'target'
                        }
                    }, {
                        '$unwind': {
                            'path': '$target'
                        }
                    }
                ]
            }
        }
    ];

    const cursor = lite ? nodesCollection.find(): nodesCollection.aggregate<WithId<AggCamNode>>(agg)
    
    const nodes = await cursor.toArray() as WithStringId<CamNode>[] | WithStringId<AggCamNode>[]
    return nodes
}

export async function getNode(id: string, lite: boolean = false): Promise<WithStringId<AggCamNode> | WithStringId<CamNode>> {
    const agg = [
        {
            '$match': { '_id': id }
        },
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
                    }, {
                        '$lookup': {
                            'from': 'Nodes', 
                            'localField': 'target', 
                            'foreignField': '_id', 
                            'as': 'target'
                        }
                    }, {
                        '$unwind': {
                            'path': '$target'
                        }
                    }
                ]
            }
        }
    ];


    if (lite) {
        const node = await nodesCollection.findOne({ _id: id })

        if (node == null) throw new Error("Resource not found", { cause: `There is no node found with id: ${id}` })
        return node
    } else {
        const result = await nodesCollection.aggregate<WithStringId<AggCamNode>>(agg).toArray()

        if (result.length != 1) throw new Error("Resource not found", { cause: `There is no node found with id: ${id}` })
        return result[0]
    }
}

export async function updateAdjacents(adjacents: Adjacent[]) {
    const promises: Promise<UpdateResult<Adjacent>>[] = []
    adjacents.forEach((adj) => {
        promises.push(adjNodesCollection.updateOne({ from: adj.from, target: adj.target }, { $set: { distance: adj.distance } }, { upsert: true }))
        promises.push(adjNodesCollection.updateOne({ from: adj.target, target: adj.from }, { $set: { distance: adj.distance } }, { upsert: true }))
    })

    await Promise.all(promises)
}

export async function createNode(node: CamNode): Promise<WithStringId<CamNode>> {
    const result = await nodesCollection.insertOne({
        ...node,
        _id: new ObjectId().toString()
    })
    const id = result.insertedId

    return { ...node, _id: id }
}

export async function editNode(node: WithStringId<CamNode>) {
    const id = node._id
    await nodesCollection.updateOne({_id: id}, { $set: node })
}

export async function deleteNode(id: string) {
    await Promise.all([
        nodesCollection.deleteOne({ _id: id }),
        adjNodesCollection.deleteMany({ from: id }),
        adjNodesCollection.deleteMany({ target: id })
    ])
}