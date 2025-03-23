import { CamNodeData } from "@/types"
import { Suspense } from "react"
import { NodeCardItemSkel, NodeDataFetcher } from "./components/NodeDataFetcher"
import Link from "next/link"

export const revalidate = 0;

function NodeGridSkel() {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <NodeCardItemSkel />
        <NodeCardItemSkel />
        <NodeCardItemSkel />
        <NodeCardItemSkel />
        <NodeCardItemSkel />
    </div>
}

async function NodeGridView() {
    const resp = await fetch(`${process.env.MODEL_SERVER_URL}/init`, { method: 'POST' })
    const items: CamNodeData[] = await resp.json()
    const url = process.env.MODEL_SERVER_URL ?? "https://localhost:5000"

    return (
        <NodeDataFetcher items={items} url={url}/>
    )
}

export default function Page() {
    return (
        <div className="min-h-dvh w-full bg-blue-50 flex flex-col">
            <div className="flex flex-row py-6 px-8 items-center">
                <div className="text-2xl font-bold">Dashboard</div>
                <div className="flex-1"/>
                <Link href={'/nodes'} className="border rounded-full px-4 py-1 hover:bg-blue-100 active:bg-blue-200">Manage Nodes</Link>
            </div>
            <div className="flex-1 flex flex-col items-center">
                <div className="flex-1 flex flex-col w-full xl:max-w-[1024px] lg:max-w-[960px] max-w-[720px] gap-4 px-4">
                    <div className="font-bold px-2">Connected Nodes</div>
                    <Suspense fallback={<NodeGridSkel />}>
                        <NodeGridView />
                    </Suspense>
                </div>
            </div>
            <div className="text-wrap text-center text-sm py-2 text-neutral-500">Web Client for Pro-Active Crowd Flow Prediction</div>
        </div>
    )
}