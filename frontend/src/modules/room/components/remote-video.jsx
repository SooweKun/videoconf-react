import { forwardRef } from "react";

export const RemoteVideo = forwardRef((ref) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Remote Videos</h3>
      <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-4"></div>
    </div>
  )
})