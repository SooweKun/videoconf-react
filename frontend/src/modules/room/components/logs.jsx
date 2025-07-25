export const Logs = ({logs}) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Logs</h3>
            <div id="logs" className="bg-white p-4 rounded-lg shadow h-40 overflow-y-auto text-sm text-gray-600">
                {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                ))}
            </div>
        </div>
    )
}