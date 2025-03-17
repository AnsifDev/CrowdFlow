"use client"

import { CamNode, WithStringId } from "@/types";
import { useRouter } from "next/navigation";

// export function CamNodeListView({ nodes }: { nodes: WithId<CamNode>[] }) {
//   const [nodeState, setNodeState] = useState(nodes) 

//   return (
//     <div className="flex flex-col flex-1 mt-2 gap-2">
//       {nodeState.map((node) => (
//         <div key={node.name} className="bg-blue-50 py-2 px-6 rounded-lg flex flex-row items-center gap-2 select-none">
//           <div className="flex-1">{node.name}</div>
//           <button onClick={(e) => {
//             e.stopPropagation()
//             deleteNode(node).then(() => setNodeState([ ...nodeState.filter((v) => v != node) ]))
//           }} className="material-symbols-rounded !text-lg text-red-500 py-1 px-2 rounded-md hover:bg-red-100">delete</button>
//           <Link href={`/nodes/${node._id}`} className="material-symbols-rounded !text-lg py-1 px-2 rounded-md hover:bg-blue-100">edit</Link>
//           <div className="material-symbols-rounded !text-lg pl-2">arrow_forward_ios</div>
//         </div>
//       ))}
//     </div>
//   )
// }

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