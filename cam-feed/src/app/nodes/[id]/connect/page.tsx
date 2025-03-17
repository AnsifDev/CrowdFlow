"use client"

import { useEffect, useRef, useState } from "react";

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ state, setState ] = useState("Unsupported Hardware")
  const [ recording, setRecording ] = useState(false)
  const [ devices, setDevices ] = useState<MediaDeviceInfo[]>([]);
  const [ selectedDevice, setSelectedDevice ] = useState(0);
  
  const startWebCam = async (deviceIndex: number) => {
    setState("Requesting Camera...")
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { ideal: devices[deviceIndex].deviceId },
        aspectRatio: 3/4,
        width: 640, // Optional: Suggest a 4:3 resolution
        height: 480,
      }
    });

    if (devices[0].deviceId == "") {
      setState("Initializing")
      const inputDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = inputDevices.filter((device) => device.kind === "videoinput");
      setDevices(videoDevices);
      console.log(videoDevices)
    }
    
    setState("Streaming")
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    setRecording(true)
  }

  const stopWebCam = () => {
    const stream = videoRef.current?.srcObject as MediaStream
    const tracks = stream.getTracks()
    tracks.forEach((track) => track.stop())
    setState("Not Streaming")

    setRecording(false)
  }

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setDevices(videoDevices);
      console.log(videoDevices)
      if (videoDevices.length > 0) setState("Not Streaming")
    })
    
  }, [])

  return (
    <div className="flex flex-col sm:items-center sm:justify-center bg-blue-100 min-h-dvh">
      <div className="md:min-h-[540px] md:w-[720px] lg:w-[960px] w-full flex-1 md:flex-none md:h-auto overflow-clip md:rounded-2xl bg-white shadow-2xl flex flex-col relative">
      <div className="text-wrap absolute top-0 left-0 right-0 pt-4 pb-8 px-4 min-h-16 bg-gradient-to-b from-black/90 flex flex-row">
        <div className="flex-1 hidden md:flex flex-row items-center justify-start"></div>
        <div className="flex-1 flex flex-row items-center md:justify-center justify-normal text-white text-center">{state}</div>
        <div className="flex-1 flex flex-row items-center justify-end gap-3">
          <button hidden={!recording || devices.length < 2} onClick={() => {
            stopWebCam();
            const nextIndex = (selectedDevice+1)%devices.length
            setSelectedDevice(nextIndex)
            startWebCam(nextIndex);
          }} className="z-10 material-symbols-rounded text-white p-1 rounded-full">cameraswitch</button>
          <button hidden={devices.length < 1} onClick={() => {
            if (!recording) startWebCam(selectedDevice);
            else stopWebCam();
          }} className="bg-blue-50 z-10 rounded-full px-4 py-1 text-black">{recording? 'End Streaming': 'Start Streaming'}</button>
        </div>
      </div>

        <video ref={videoRef} width={1024} height={768} autoPlay className="flex-1 bg-black w-full h-full"/>
        
        <div className="text-wrap absolute bottom-0 left-0 right-0 text-center text-sm pb-4 pt-8 bg-gradient-to-t from-black/90 text-white">Camera Client for Pro-Active Crowd Flow Prediction</div>
      </div>
    </div>
  )
}