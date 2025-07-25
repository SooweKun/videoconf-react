import React, { useEffect, useRef } from 'react';

export const RemoteVideo = ({remoteStreams}) => {
    const videoRef = useRef(null);

 useEffect(() => {
    if (remoteStreams && videoRef.current) {
      videoRef.current.srcObject = remoteStreams;
    }
  }, [remoteStreams]);

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Remote Videos</h3>
            {remoteStreams ? (
             <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto bg-black rounded-lg"
             />
            ) : (
             <div className="w-full h-48 flex items-center justify-center bg-black rounded-lg">
                <p className="text-white">Ожидание собеседника...</p>
             </div>
            )}
        </div>
    )
}