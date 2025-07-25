// import { useState } from "react"
// import { Logs } from "./components/logs"
// import { RemoteVideo } from "./components/remote-video"
// import { Video } from "./components/video"
// import { useRef, useEffect } from "react"


// const wsUrl = `ws://127.0.0.1:6069/api/websocket`;

// export const RoomModule = () => {
  
//   const [logs, setLogs] = useState([]);
//   const [stream, setStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const isConnectedRef = useRef(false)
//   const socketRef = useRef(null);
//   const videoRef = useRef(null);
//   const pc = useRef(null);

//   useEffect(() => {
//     const socket = new WebSocket(wsUrl);
//     socketRef.current = socket;

//     socket.onopen = () => {
//       console.log(isConnectedRef, "connected");
//       setLogs(prevLogs => [...prevLogs, "соединение установлено"]);
//       isConnectedRef.current = true;
//     };

//     socket.onmessage = (e) => {
//       console.log("WebSocket сообщение:", e.data);
//       setLogs(prevLogs => [...prevLogs, "получен оффер с кандидатами"]);
//       const message = JSON.parse(e.data); //парсим данные с ответов 

//       console.log("WebSocket сообщение получено, тип:", message.type);

//       switch (message.type) {
//         case 'answer':
//           setLogs(prevLogs => [...prevLogs, "получен answer от другого пира"]);
//           handleOffer(message.sdp); 
//           break;

//         case 'candidate':
//           handleNewICECandidate(message.candidate);
//           break;
          
//         default:
//           console.warn('Неизвестный тип сообщения от WebSocket');
//       }
//     };

//     socket.onclose = () => {
//       setLogs(prevLogs => [...prevLogs, "соединение закрыто"]);
//       isConnectedRef.current = false;
//     };

//     socket.onerror = (error) => {
//       console.error("WebSocket ошибка:", error);
//       setLogs(prevLogs => [...prevLogs, "ошибка соединения"]);
//     };

//     return () => {
//       console.log("Закрываем WebSocket соединение");
//     };

//   }, [])

//   useEffect(() => {

//     return () => {

//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//         console.log("Компонент размонтирован, камера выключена.");
//       }

//     };
//   }, [stream]);

//   useEffect(() => {

//     if (stream && videoRef.current) {
//       videoRef.current.srcObject = stream;
//     }
    
//   }, [stream]); 

//   const mediaGet = async () => {

//     try {

//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true 
//       });
//       setLogs(prevLogs => [...prevLogs, "медиа получен"]);
//       console.log(stream, "stream");
//       setStream(mediaStream);

//     } catch(err) {
//       console.log(err, "медиа");
//       setLogs(prevLogs => [...prevLogs, "ошибка получения медиа"]);
//     }

//   }

//   const stunServer = {
//     iceServers: [
//       {
//       urls: 'stun:stun.l.google.com:19302'
//       }
//     ]
//   }

//   const sendMessage = (message) => {
//     if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//       socketRef.current.send(JSON.stringify(message));
//     }
//   }

//   const createPeerConnection = () => {

//     if (pc.current) {
//       pc.current.close();
//     }
    
//     const peerConnection = new RTCPeerConnection(stunServer);

//     peerConnection.onicecandidate = (e) => {
//       if (e.candidate) {
//         setLogs(prev => [...prev, "Отправка candidate..."]);
//         sendMessage({ type: 'candidate', candidate: e.candidate });
//       }
//     }

//     peerConnection.ontrack = (event) => {
//       setLogs(prev => [...prev, "Получен удаленный трек!"]);
//       setRemoteStream(event.streams[0]);
//     };

//     if (stream) {
//       stream.getTracks().forEach(track => {
//         peerConnection.addTrack(track, stream);
//       });
//       setLogs(prev => [...prev, "Локальные треки добавлены в PeerConnection"]);
//     }

//     pc.current = peerConnection;

//   }

//   const Call = async () => {
//     if (!stream) {
//       alert("Сначала включите камеру!");
//       return;
//     }
//     setLogs(prev => [...prev, "Начинаем звонок..."]);
//     createPeerConnection();
//   }

//   const handleOffer = async (offer) => {
//     if (!stream) {
//       await mediaGet(); 
//     }

//     createPeerConnection();
//     await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
    
//     const answer = await pc.current.createAnswer();
//     await pc.current.setLocalDescription(answer);

//     setLogs(prev => [...prev, "Answer создан, отправляем..."]);
//     sendMessage({ type: 'answer', sdp: pc.current.localDescription });
//   }

//   const handleAnswer = async (answer) => {
//     await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
//     setLogs(prev => [...prev, "Соединение установлено!"]);
//   };

//   const handleNewICECandidate = async (candidate) => {
//     if (pc.current && candidate) {
//       try {
//         await pc.current.addCandidate(new RTCIceCandidate(candidate));
//       } catch (e) {
//         console.error("Ошибка добавления ICE candidate:", e);
//       }
//     }
//   };

//   return (
//     <div className="container mx-auto p-4 max-w-4xl">
//       <h1 className="text-2xl font-bold text-gray-800 mb-4">WebRTC Video Chat</h1>
//       <Video mediaGet={mediaGet} ref={videoRef} stream={stream} Call={Call}/>
//         <RemoteVideo remoteStream={remoteStream}/>
//       <Logs logs={logs}/>
//     </div>
//   )
// }