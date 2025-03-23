import { Streamer } from "./components/Streamer"

type PageParams = {
  id: string
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const { id } = await params
  const url = process.env.MODEL_SERVER_URL ?? "https://localhost:5000"

  return <Streamer id={id} modelServerUrl={url}/>
}