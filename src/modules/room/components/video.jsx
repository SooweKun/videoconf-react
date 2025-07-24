import { forwardRef } from "react";

export const Video = forwardRef((ref, handleToggleCamera)=> {
    
    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Local Video</h3>
            <div className="relative bg-gray-200 rounded-lg overflow-hidden">
                <video id="localVideo" width="320" height="240" autoPlay muted className="w-full" ref={ref}></video>
                <div id="localVideoPlaceholder"
                className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-600">Camera is off</div>
            </div>
            <button 
                id="toggleCamera"
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={handleToggleCamera.toggleCamera}
                >
                Enable Camera
            </button>
        </div>
    )
}) 