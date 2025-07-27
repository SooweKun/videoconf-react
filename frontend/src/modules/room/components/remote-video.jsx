import { forwardRef } from "react";

export const RemoteVideo = forwardRef((props, ref) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Remote Videos</h3>
      <div className="relative bg-gray-500 rounded-lg overflow-hidden w-[320px] h-[240px]">
        <video 
          ref={ref}
          width="320"
          height="240"
          autoPlay 
          muted 
          className="w-full hidden" />
      </div>
    </div>
  )
})