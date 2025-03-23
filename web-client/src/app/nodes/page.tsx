import Link from "next/link";
import { Suspense } from "react";
import { CamNodeListItem } from "./components/CamNodeListView";
import { getAllNodes } from "@/ports";

// export const experimental_ppr = true
export const revalidate = 0;

async function NodesListView() {
  const nodes = await getAllNodes(true)

  // if (nodes.length == 0) redirect("/nodes/create")

  return (
    <div className="flex flex-col flex-1 mt-2 gap-2">
      {nodes.map((node) => (
        <CamNodeListItem node={node} key={node.name} />
      ))}
      
      {/* <div className="bg-blue-50 py-2 px-6 rounded-lg flex flex-row items-center gap-4">
        <div className="flex-1">Node B</div>
        <Link href={"/nodes/n2"} className="material-symbols-rounded !text-lg p-1 px-2 rounded-md hover:bg-blue-100">edit</Link>
        <div className="material-symbols-rounded !text-lg">arrow_forward_ios</div>
      </div>
      <div className="bg-blue-50 py-2 px-6 rounded-lg flex flex-row items-center gap-4">
        <div className="flex-1">Node C</div>
        <Link href={"/nodes/n3"} className="material-symbols-rounded !text-lg p-1 px-2 rounded-md hover:bg-blue-100">edit</Link>
        <div className="material-symbols-rounded !text-lg">arrow_forward_ios</div>
      </div>
      <div className="bg-blue-50 py-2 px-6 rounded-lg flex flex-row items-center gap-4">
        <div className="flex-1">Node D</div>
        <Link href={"/nodes/n4"} className="material-symbols-rounded !text-lg p-1 px-2 rounded-md hover:bg-blue-100">edit</Link>
        <div className="material-symbols-rounded !text-lg">arrow_forward_ios</div>
      </div>
      <div className="bg-blue-50 py-2 px-6 rounded-lg flex flex-row items-center gap-4">
        <div className="flex-1">Node E</div>
        <Link href={"/nodes/n5"} className="material-symbols-rounded !text-lg p-1 px-2 rounded-md hover:bg-blue-100">edit</Link>
        <div className="material-symbols-rounded !text-lg">arrow_forward_ios</div>
      </div>
      <div className="bg-blue-50 py-2 px-6 rounded-lg flex flex-row items-center gap-4">
        <div className="flex-1">Node F</div>
        <Link href={"/nodes/n6"} className="material-symbols-rounded !text-lg p-1 px-2 rounded-md hover:bg-blue-100">edit</Link>
        <div className="material-symbols-rounded !text-lg">arrow_forward_ios</div>
      </div> */}
    </div>
  )
}

function NodesListViewSkel() {
  return (
    <div className="flex flex-col flex-1 mt-2 gap-2 select-none animate-pulse">
      <div className="bg-blue-50 py-2 px-6 rounded-lg flex flex-row items-center gap-4">
        <div className="flex-1">
          <div className="h-4 w-48 rounded bg-blue-100"/>
        </div>
        {/* <div className="material-symbols-rounded !text-lg p-1 px-2">edit</div> */}
        <div className="material-symbols-rounded !text-lg py-1">arrow_forward_ios</div>
      </div>
      <div className="bg-blue-50 py-2 px-6 rounded-lg flex flex-row items-center gap-4">
        <div className="flex-1">
          <div className="h-4 w-48 rounded bg-blue-100"/>
        </div>
        {/* <div className="material-symbols-rounded !text-lg p-1 px-2">edit</div> */}
        <div className="material-symbols-rounded !text-lg py-1">arrow_forward_ios</div>
      </div>
      <div className="bg-blue-50 py-2 px-6 rounded-lg flex flex-row items-center gap-4">
        <div className="flex-1">
          <div className="h-4 w-48 rounded bg-blue-100"/>
        </div>
        {/* <div className="material-symbols-rounded !text-lg p-1 px-2">edit</div> */}
        <div className="material-symbols-rounded !text-lg py-1">arrow_forward_ios</div>
      </div>
      <div className="bg-blue-50 py-2 px-6 rounded-lg flex flex-row items-center gap-4">
        <div className="flex-1">
          <div className="h-4 w-48 rounded bg-blue-100"/>
        </div>
        {/* <div className="material-symbols-rounded !text-lg p-1 px-2">edit</div> */}
        <div className="material-symbols-rounded !text-lg py-1">arrow_forward_ios</div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <div className="flex flex-col sm:items-center sm:justify-center bg-blue-100 min-h-dvh">
      <div className="md:min-h-[540px] md:w-[720px] lg:w-[960px] w-full flex-1 md:flex-none md:h-auto overflow-auto sm:rounded-2xl bg-white shadow-2xl flex flex-col sm:px-8 px-4 sm:py-4 py-2">
        <div className="flex-1 flex flex-col gap-4">
          <div className="text-[64px] font-bold text-black text-center sm:mt-4 mt-16 italic">Hello</div>
          <div className="flex sm:flex-row flex-col sm:gap-4 gap-8 flex-1">
            <div className="flex flex-col sm:flex-1 justify-center">
              <div className="md:!text-[230px] sm:!text-[180px] !text-[150px] text-center material-symbols-rounded">photo_camera</div>
            </div>
            <Suspense fallback={<NodesListViewSkel />}>
              <NodesListView />
            </Suspense>
          </div>
        </div>
        <div className="flex flex-row sm:my-8 my-4 min-h-13 gap-4 pl-4 pr-1.5 py-1.5 bg-blue-50 rounded-lg">
          <div className="text-sm flex-1 self-center">Create new nodes if more nodes are required</div>
          <Link href={"/nodes/create"} className="text-nowrap bg-white py-1 px-6 flex items-center rounded-md">Add Nodes</Link>
        </div>
        <div className="text-wrap text-center text-sm text-neutral-500">Camera Client for Pro-Active Crowd Flow Prediction</div>
      </div>
    </div>
  );
}
