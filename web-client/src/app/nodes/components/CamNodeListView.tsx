"use client"

import { CamNode, WithStringId } from "@/types";
import { useRouter } from "next/navigation";

export function CamNodeListItem({ node }: { node: WithStringId<CamNode> }) {
  const router = useRouter()
  return (
    <div onClick={(e) => {
      e.stopPropagation()
      router.push(`/nodes/${node._id}/connect`)
    }} className="bg-blue-50 py-2 px-6 rounded-lg flex flex-row items-center gap-4 select-none">
      <div className="flex-1">{node.name}</div>
      <div onClick={(e) => {
        e.stopPropagation()
        router.push(`/nodes/${node._id}`)
      }} className="material-symbols-rounded !text-lg py-1 px-2 rounded-md hover:bg-blue-100">edit</div>
      <div className="material-symbols-rounded !text-lg">arrow_forward_ios</div>
    </div>
  )
}