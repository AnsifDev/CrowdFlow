import { AggCamNode, WithStringId } from "@/types";
import { NodeEditCard } from "../components/NodeEditCard";
import { notFound } from "next/navigation";
import { getNode } from "@/ports";

type PageParams = {
  id: string
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const { id } = await params

  const node = await getNode(id) as WithStringId<AggCamNode> | null
  if (node == null) notFound()

  return (
    <div className="flex flex-col items-center justify-center bg-blue-100 min-h-screen">
      <NodeEditCard node={node}/>
    </div>
  )
}
