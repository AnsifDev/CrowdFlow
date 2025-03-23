import { MongoClient } from "mongodb";
import { Adjacent, CamNode, WithStringId } from "./types";

const client = new MongoClient(process.env.MONGODB_URI!)
export const db = client.db("Crowd")
export const nodesCollection = db.collection<WithStringId<CamNode>>("Nodes")
export const adjNodesCollection = db.collection<WithStringId<Adjacent>>("Adjacents")