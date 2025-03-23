"use client"

import { CamNodeData, UpdateData } from "@/types";
import { useEffect, useState } from "react";

export function NodeCardItem({ data, updation }: { data: CamNodeData, updation?: Record<string, UpdateData>|null }) {
    const className = {
        safe: {
            bg: "bg-green-50",
            text: "text-green-900"
        },
        caution: {
            bg: "bg-yellow-50",
            text: "text-yellow-900"
        },
        risk: {
            bg: "bg-red-50",
            text: "text-red-900"
        },
        hiRisk: {
            bg: "bg-red-100",
            text: "text-red-900"
        }
    }

    const getStyle = (status: string) => {
        if (status == 'Safe') return className.safe
        if (status == 'Caution') return className.caution
        if (status == 'Risk') return className.risk
        if (status == 'Hi Risk') return className.hiRisk
    }

    return (
        <div className={`h-16 pr-2 py-1 ${getStyle(updation?.[data._id]?.status ?? data.status)?.bg} rounded-xl shadow flex flex-row`}>
            <div className="min-w-16 flex flex-col items-center justify-center">
                <div className="!text-[32px] text-center material-symbols-rounded">photo_camera</div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col py-1 justify-center">
                <div className="text-nowrap truncate">{data.name}</div>
                <div className={`text-sm font-bold ${getStyle(data.status)?.text}`}>{data.status}</div>
            </div>
            <div className="min-w-16 flex items-center justify-center text-xl font-bold">{(updation?.[data._id]?.count ?? data.count).toFixed(2)}</div>
        </div>
    )
}

export function NodeCardItemSkel() {
    return (
        <div className={`h-16 pr-2 py-1 bg-white rounded-xl shadow flex flex-row animate-pulse`}>
            <div className="min-w-16 flex flex-col items-center justify-center">
                <div className="!text-[32px] text-center material-symbols-rounded">photo_camera</div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col py-1 justify-center gap-1">
                <div className="w-16 h-4 rounded bg-neutral-200"/>
                <div className="w-12 h-3 rounded-sm bg-neutral-200"/>
            </div>
            <div className="min-w-16 flex items-center justify-center text-xl font-bold">xx%</div>
        </div>
    )
}

export function NodeDataFetcher({ items, url }: { items: CamNodeData[], url: string }) {
    const [ updation, setUpdation ] = useState<Record<string, UpdateData>|null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`${url}/log`).then((resp) => resp.json()).then((value: Record<string, UpdateData>) => {
                setUpdation(value)
                console.log(value)
            })
        }, 5000)

        return () => clearInterval(interval)
    })
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {
                items.map((item) => (
                    <NodeCardItem key={item._id} data={item} updation={updation} />
                ))
            }
        </div>
    )
}