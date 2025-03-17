import { adjNodesCollection } from "@/db";
import { Adjacent, AggAdjacent } from "@/types";
import { ObjectId, UpdateResult } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

type PostRouteParams = {
    id: string
}

export async function POST(request: NextRequest, { params }: { params: Promise<PostRouteParams> }) {
    const adjs: AggAdjacent[] = await request.json()
    const { id } = await params

    const promises: Promise<UpdateResult<Adjacent>>[] = []
    adjs.forEach((adj) => {
        promises.push(adjNodesCollection.updateOne({ from: new ObjectId(id), target: new ObjectId(adj.target._id) }, { $set: { distance: adj.distance } }, { upsert: true }))
        promises.push(adjNodesCollection.updateOne({ from: new ObjectId(adj.target._id), target: new ObjectId(id) }, { $set: { distance: adj.distance } }, { upsert: true }))
    })

    await Promise.all(promises)
    return NextResponse.json({})
}