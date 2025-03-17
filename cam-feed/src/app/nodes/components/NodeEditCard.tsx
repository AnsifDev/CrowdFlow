"use client"

import { createNode, deleteNode, editNode, getAllNodes, updateAdjacents } from "@/ports";
import { NodeType, AggCamNode, CamNode, AggAdjacent, WithStringId } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function indexOf(arr: WithStringId<CamNode>[], item: WithStringId<CamNode>) {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];

    if (element._id == item._id) return i
  }

  return -1
}

function NodesChipView({thisNode, nodes, adjs, onClicked = () => {}}: {thisNode?: WithStringId<AggCamNode>, nodes: WithStringId<AggCamNode>[], adjs: AggAdjacent[], onClicked?: (node: WithStringId<AggCamNode>) => void}) {
  const selectedNodes = adjs.map((adj) => adj.target)
  const remainingNodes = nodes.filter((node) => indexOf(selectedNodes, node) == -1 && node._id != thisNode?._id)

  return (
    <div className="flex flex-wrap gap-2 select-none">
      {remainingNodes.map((node) => (
        <div key={node._id.toString()} onClick={() => onClicked(node)} className="rounded-md border-[1px] border-blue-200 py-1 px-2 gap-1 flex flex-row">
          <div className="!text-sm material-symbols-rounded">add</div>
          <div className="text-sm mx-1">{node.name}</div>
        </div>
      ))}
      
      {/* <div className="rounded-md border-[1px] border-blue-200 py-1 px-2 gap-1 flex flex-row">
        <div className="!text-sm material-symbols-rounded">add</div>
        <div className="text-sm mx-1">CamNode E</div>
      </div>
      <div className="rounded-md border-[1px] border-blue-200 py-1 px-2 gap-1 flex flex-row">
        <div className="!text-sm material-symbols-rounded">add</div>
        <div className="text-sm mx-1">CamNode F</div>
      </div> */}
    </div>
  )
}

function NodesChipViewSkel() {
  return (
    <div className="flex flex-wrap gap-2 animate-pulse">
      <div className="rounded-md border-[1px] border-blue-200 py-1 px-2 gap-1 flex flex-row items-center">
        <div className="!text-sm material-symbols-rounded">add</div>
        <div className="h-4 w-16 rounded bg-blue-100 mx-1"/>
      </div>
      <div className="rounded-md border-[1px] border-blue-200 py-1 px-2 gap-1 flex flex-row items-center">
        <div className="!text-sm material-symbols-rounded">add</div>
        <div className="h-4 w-16 rounded bg-blue-100 mx-1"/>
      </div>
      <div className="rounded-md border-[1px] border-blue-200 py-1 px-2 gap-1 flex flex-row items-center">
        <div className="!text-sm material-symbols-rounded">add</div>
        <div className="h-4 w-16 rounded bg-blue-100 mx-1"/>
      </div>
    </div>
  )
}

function AdjNodeEditor({adj, onDelete = () => {}}: {adj: AggAdjacent, onDelete?: () => void}) {
  const [distance, setDistance] = useState(adj.distance)
  return (
    <div className="flex flex-row rounded-lg bg-blue-50 px-3 py-2 gap-2">
      <div>{adj.target.name}</div>
      <div className="italic text-neutral-600">takes</div>
      <input value={distance} onChange={(e) => {
        const newDist = Number.parseInt(e.target.value.length == 0? "0": e.target.value)
        setDistance(newDist)
        adj.distance = newDist
      }} type="number" className="outline-none px-4 w-24"/>
      <div className="italic text-neutral-600 flex-1">seconds</div>
      <div onClick={() => onDelete()} className="material-symbols-rounded rounded-full">close</div>
    </div>
  )
}

export function NodeEditCard({ node = undefined }: { node?: WithStringId<AggCamNode> }) {
  const [name, setName] = useState(node?.name ?? "")
  const [capacity, setCapacity] = useState(node?.capacity ?? 1)
  const [adjacent, setAdjacent] = useState<AggAdjacent[]>(node?.adjacent ?? [])
  const [type, setType] = useState(node?.type ?? NodeType.normal)
  const [loading, setLoading] = useState(true)
  const [nodes, setNodes] = useState<WithStringId<AggCamNode>[]|undefined>()
  const router = useRouter()

  useEffect(() => {
    getAllNodes().then((value) => {
      setNodes(value as WithStringId<AggCamNode>[])
      setLoading(false)
    })
    // fetch("/api/nodes").then((resp) => resp.json()).then((value: WithStringId<AggCamNode>[]) => {
    //   setNodes(value)
    //   setLoading(false)
    // })
  }, [])

  return (
    <div className="min-h-[540px] w-[960px] rounded-2xl bg-white shadow-2xl flex flex-col px-8 py-4 relative">
      <div className="flex-1 flex flex-col gap-4">
        <div className="text-[40px] font-bold text-black text-center mt-8 mb-4 italic">{node == undefined? "Create New Node": `Edit ${node.name}`}</div>
        <div className="flex flex-row gap-4 flex-1">
          <div className="flex flex-col flex-1 justify-center">
            <div className="!text-[230px] text-center material-symbols-rounded">add_a_photo</div>
          </div>
          <div className="flex flex-col flex-1 gap-4 pt-8">
            <div className="flex flex-col gap-1">
              <div className="text-xs text-neutral-500 ml-1">Set Node Name</div>
              <input value={name} onChange={(e) => setName(e.target.value)} className="outline-none bg-blue-50 rounded-md px-2 py-1"/>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs text-neutral-500 ml-1">Set Node Capacity</div>
              <input type="number" value={capacity} onChange={(e) => setCapacity(Number.parseInt(e.target.value.length > 0? e.target.value: "0"))} className="outline-none bg-blue-50 rounded-md px-2 py-1"/>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs text-neutral-500 ml-1">Set Node Type</div>
              <div className="flex flex-row gap-2 p-1 bg-blue-50 rounded-full select-none">
                <div onClick={() => setType(NodeType.normal)} className={`flex-1 p-1.5 rounded-full text-sm text-center ${type == NodeType.normal? "bg-white": "hover:bg-white/70"}`}>Normal</div>
                <div onClick={() => setType(NodeType.spawning)} className={`flex-1 p-1.5 rounded-full text-sm text-center ${type == NodeType.spawning? "bg-white": "hover:bg-white/70"}`}>Spawning</div>
                <div onClick={() => setType(NodeType.attractive)} className={`flex-1 p-1.5 rounded-full text-sm text-center ${type == NodeType.attractive? "bg-white": "hover:bg-white/70"}`}>Attraction</div>
              </div>
            </div>
            {(loading || (nodes?.length ?? 0) > 0) && (<div className="flex flex-col gap-1">
              <div className="text-xs text-neutral-500 text-center ml-1">Set Node Adjacent Connections</div>
              <div className="flex flex-col gap-4">
                {loading? <NodesChipViewSkel />: <NodesChipView thisNode={node} nodes={nodes!} adjs={adjacent} onClicked={ (adjNode) => setAdjacent([ ...adjacent, { target: adjNode as WithStringId<CamNode>, distance: 1 } ]) }/>}
                <div className="flex-1 flex flex-col gap-2">
                  {adjacent.map((adj) => (
                    <AdjNodeEditor key={adj.target.name} adj={adj} onDelete={ () => setAdjacent([ ...adjacent.filter((v) => v != adj) ]) }/>
                  ))}
                  
                </div>
              </div>
            </div>)}
          </div>
        </div>
      </div>
      { (node == undefined) && (<div className="flex flex-row mt-8 gap-4 pl-4 pr-1.5 py-1.5 bg-blue-50 rounded-lg">
        <div className="text-sm">By continuing, you are accepting that this newly created node can be used as a camera node so any client can connect on behalf of this node and can supply data to the pro active crowd flow management network</div>
        <button onClick={() => {
          if (name.length == 0) return;
          if (capacity <= 0) return;

          createNode({
            name: name,
            capacity: capacity,
            type: type
          }).then((insertedNode) => {
            updateAdjacents(adjacent.map((adj) => ({
              distance: adj.distance,
              target: adj.target._id,
              from: insertedNode._id
            })))
          }).then(() => {
            router.back()
            router.refresh()
            // router.push("/")
          })

          // fetch("/api/nodes", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json"
          //   },
          //   body: JSON.stringify({
          //     name: name,
          //     capacity: capacity,
          //     type: type
          //   })
          // }).then((resp) => resp.json()).then((insertedNode: WithId<CamNode>) => {
          //   fetch(`/api/nodes/${insertedNode._id.toString()}/adjs`, {
          //     method: "POST",
          //     headers: {
          //       "Content-Type": "application/json"
          //     },
          //     body: JSON.stringify(adjacent)
          //   })
          // }).then(() => router.push("http://localhost:3000/"))
        }} className="text-nowrap bg-white py-1 px-6 rounded-md">Agree & Create</button>
      </div>)}
      <div className="text-wrap text-center text-sm text-neutral-500 mt-4">Camera Client for Pro-Active Crowd Flow Prediction</div>
      <div className="flex absolute top-7 left-5 gap-2">
        <button onClick={() => router.back()} className="material-symbols-rounded p-2 rounded-md hover:bg-blue-50">arrow_back_ios_new</button>
        {(node != undefined) && (<button onClick={() => {
          // fetch(`/api/nodes/${node._id}`, { method: 'DELETE' }).then(() => {
          //   router.back()
          // })
          deleteNode(node._id).then(() => {
            router.back()
            const promise = new Promise((resolver) => setTimeout(resolver, 500))
            return promise
          }).then(() => {
            console.log("Refresh")
            router.refresh()
          })
        }} className="material-symbols-rounded p-2 rounded-md text-red-500 hover:bg-red-50">delete</button>)}
      </div>
      
      {(node != undefined) && (<button onClick={() => {
        editNode({
          _id: node._id,
          name: name,
          capacity: capacity,
          type: type
        }).then(() => {
          updateAdjacents(adjacent.map((adj) => ({
            distance: adj.distance,
            target: adj.target._id,
            from: node._id
          })))
        }).then(() => {
          router.back()
          router.refresh()
          // router.push("/")
        })
        // fetch(`/api/nodes/${node._id}`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json"
        //   },
        //   body: JSON.stringify({
        //     name: name,
        //     capacity: capacity,
        //     type: type
        //   })
        // }).then((resp) => resp.json()).then((insertedNode: WithId<CamNode>) => {
        //   fetch(`/api/nodes/${insertedNode._id.toString()}/adjs`, {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify(adjacent)
        //   })
        // }).then(() => router.push("http://localhost:3000/")) 
      }} className="absolute top-8 right-6 py-2 px-4 rounded-md bg-blue-50">Save Node</button>)}
    </div>
  );
}