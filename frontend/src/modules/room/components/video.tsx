import { forwardRef } from "react";

interface Props {
    toggleCamera: () => void;
    isCameraOn: boolean;
    wsConnected: boolean;
}

export const Video = forwardRef<HTMLVideoElement, Props>(({ toggleCamera, isCameraOn, wsConnected}, ref) => {

    const buttonClasses = `mt-2 px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    isCameraOn 
      ? 'bg-red-500 hover:bg-red-600' 
      : 'bg-blue-500 hover:bg-blue-600'
  }`;

     return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Local Video</h3>
            <div className=" rounded-lg  w-full h-[240px]">
                <video
                    ref={ref}
                    width="320"
                    height="240"
                    autoPlay
                    muted
                    className="w-full h-full"
                />
            </div>
            <button
                onClick={toggleCamera}
                className={buttonClasses}
                disabled={!wsConnected}
                >
                {isCameraOn ? 'Disable Camera' : 'Enable Camera'}
            </button>
            {!wsConnected && (
            <p className="text-red-500 mt-2">WebSocket connection failed. Please check your server.</p>
            )}
        </div>
    ) 
})