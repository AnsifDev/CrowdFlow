import { adjNodesCollection, nodesCollection } from "@/db";
import { CamNode, AggCamNode } from "@/types";
import { ObjectId, WithId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

type PostRouteParams = {
    id: string
}

export async function GET(request: NextRequest, { params }: { params: Promise<PostRouteParams> }) {
    const { id } = await params
    const url = new URL(request.url)
    const urlParams = url.searchParams

    const agg = [
        {
            '$match': { '_id': new ObjectId(id) }
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


    if (urlParams.get("lite") == "true") {
        const node = await nodesCollection.findOne({ _id: new ObjectId(id) })

        if (node == null) return NextResponse.json({ error: "Resource not found" }, { status: 404 })
        return NextResponse.json(node)
    } else {
        const result = await nodesCollection.aggregate<WithId<AggCamNode>>(agg).toArray()

        if (result.length != 1) return NextResponse.json({ error: "Resource not found" }, { status: 404 })
        return NextResponse.json(result[0])
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<PostRouteParams> }) {
    const { id } = await params
    const node: CamNode = await request.json()

    await nodesCollection.updateOne({_id: new ObjectId(id)}, { $set: node })
    return NextResponse.json( { ...node, _id: new ObjectId(id) } )
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<PostRouteParams> }) {
    const { id } = await params

    await Promise.all([
        nodesCollection.deleteOne({ _id: new ObjectId(id) }),
        adjNodesCollection.deleteMany({ from: new ObjectId(id) }),
        adjNodesCollection.deleteMany({ target: new ObjectId(id) })
    ])
    return NextResponse.json({})
}