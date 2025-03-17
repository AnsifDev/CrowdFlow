import { nodesCollection } from "@/db";
import { CamNode, AggCamNode } from "@/types";
import { WithId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url)
    const urlParams = url.searchParams

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

    const cursor = urlParams.get("lite") == "true" ? nodesCollection.find(): nodesCollection.aggregate<WithId<AggCamNode>>(agg)
    const nodes = await cursor.toArray()
    // nodes[0].adjacent[0].target.
    return NextResponse.json(nodes)
}

export async function POST(request: NextRequest) {
    const node: CamNode = await request.json()

    const result = await nodesCollection.insertOne(node)
    return NextResponse.json( { ...node, _id: result.insertedId } )
}