import { forwardRef } from "react";

export const Video = forwardRef(({ toggleCamera, isCameraOn, wsConnected}, ref) => {

    const buttonClasses = `mt-2 px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    isCameraOn 
      ? 'bg-red-500 hover:bg-red-600' 
      : 'bg-blue-500 hover:bg-blue-600'
  }`;

     return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Local Video</h3>
            <div className="relative bg-gray-200 rounded-lg overflow-hidden">
                <video 
                    ref={ref}
                    width="320" 
                    height="240" 
                    autoPlay 
                    muted 
                    className="w-full hidden"
                />
                <div  
                    className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-600"
                >
                    Camera is off
                </div>
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