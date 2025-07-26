import { useRef, useEffect } from "react";

export const RemoteVideo = ({stream}) => {
  const remoteVideosRef = useRef(null);

  useEffect(() => {
    if (remoteVideosRef.current) {
      remoteVideosRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Remote Videos</h3>
      <video
        ref={remoteVideosRef} 
        autoPlay
        playsInline
        controls
        className="w-full h-full rounded-lg"
      />
    </div>
  )
}