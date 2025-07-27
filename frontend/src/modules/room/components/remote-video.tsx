export const RemoteVideo = ({ remoteStreams }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Remote Videos</h3>
      <div className="relative rounded-lg w-fullh-[240px] flex flex-col gap-2 p-1">
        {remoteStreams.map((stream, index) => (
          <video
            key={index}
            ref={el => el && (el.srcObject = stream)}
            autoPlay
            playsInline
           className="min-w-[100px] w-full max-w-[320px] h-[240px] rounded-lg"
          />
        ))}
      </div>
    </div>
  );
};