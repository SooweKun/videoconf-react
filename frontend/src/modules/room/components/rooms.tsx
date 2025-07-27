const Room = [
    {roomid: 1, name: 'Room 1'},
    {roomid: 2, name: 'Room 2'},
]

export const Rooms = ({setUserId, handleRoomSelect}) => {
    return (
        <div className="w-full mt-2.5 gap-[15px]">
            <input 
                type="text" 
                placeholder="Enter your id"  
                className="w-[320px] h-[50px] pl-[10px] rounded-[8px] bg-gray-200 cursor-pointer text-2xl text-amber-400"
                onChange={(e) => setUserId(e.target.value)}
            />
            <div className=" flex justify-between items-center mt-[15px] gap-[15px]">
                {Room.map(({ name, roomid}) => (
                <div
                    onClick={() => handleRoomSelect(roomid)}
                    key={roomid}
                    className="min-w-[100px] w-full max-w-[320px] h-[150px] rounded-3xl bg-gray-200 hover:bg-gray-300 cursor-pointer text-2xl text-amber-400 flex items-center justify-center">
                        <p>name: {name}</p>
                </div>
                ))}
            </div>
        </div>
    )
}