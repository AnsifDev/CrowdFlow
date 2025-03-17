export type Adjacent = {
    from: string,
    target: string,
    distance: number
}

export type AggAdjacent = Omit<Omit<Adjacent, "from">, "target"> & {
    target: WithStringId<CamNode>
}

export enum NodeType {
    normal = "normal",
    spawning = "spawning",
    attractive = "attractive"
}

export type CamNode = {
    name: string,
    capacity: number,
    type: NodeType,
}

export type WithStringId<TSchema> = Omit<TSchema, '_id'> & {
    _id: string
}

export type AggCamNode = CamNode & {
    adjacent: AggAdjacent[],
}