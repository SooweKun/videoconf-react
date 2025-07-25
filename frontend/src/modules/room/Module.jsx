import { useState, useRef, useEffect } from "react";
import { Logs } from "./components/logs";
import { RemoteVideo } from "./components/remote-video";
import { Video } from "./components/video";

const wsUrl = `ws://127.0.0.1:6069/api/websocket`;

export const RoomModule = () => {
  const [logs, setLogs] = useState([]);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null); 

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const pc = useRef(null); 

  const logMessage = (message) => {
    console.log(message);
    setLogs(prevLogs => [...prevLogs, message]);
  };

  useEffect(() => {
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      logMessage("WebSocket: Соединение установлено. Ожидание звонка от сервера...");
    };

    socket.onmessage = async (e) => {
      let msg;
      try {
        msg = JSON.parse(e.data);
      } catch (err) {
        return logMessage(`Ошибка парсинга JSON: ${err}`);
      }
      
      if (!msg || !msg.event) {
        return logMessage("Получено некорректное сообщение");
      }
      
      switch (msg.event) {
        case 'offer':
          logMessage("Получен 'offer' от сервера.");
          handleOfferFromServer(msg.data); 
          break;

        case 'candidate':
          handleNewICECandidate(msg.data);
          break;

        default:
          logMessage(`Неизвестное событие от сервера: ${msg.event}`);
      }
    };

    socket.onclose = () => logMessage("WebSocket: Соединение закрыто");
    socket.onerror = (error) => logMessage(`WebSocket: Ошибка - ${error.message || 'Неизвестная ошибка'}`);

    return () => {
      if (socket) socket.close();
      if (pc.current) pc.current.close();
    };
  }, []); 

  const mediaGet = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      logMessage("Камера и микрофон включены");
      setStream(mediaStream);
    } catch (err) {
      logMessage(`Ошибка получения медиа: ${err}`);
    }
  };
  
  useEffect(() => {
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  const stunServer = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      logMessage("Ошибка отправки: WebSocket не готов.");
    }
  };

  const createPeerConnection = () => {
    if (pc.current) {
      logMessage("Закрываем старое PeerConnection.");
      pc.current.close();
    }
    
    logMessage("Создаем новое PeerConnection.");
    const peerConnection = new RTCPeerConnection(stunServer);
    
    peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        sendMessage({ event: 'candidate', data: JSON.stringify(e.candidate) });
      }
    };

    peerConnection.ontrack = (event) => {
      logMessage("Получен удаленный трек от сервера!");
      setRemoteStream(event.streams[0]);
    };

    if (stream) {
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      logMessage("Локальные треки добавлены в PeerConnection.");
    }

    pc.current = peerConnection;
  };

  const handleOfferFromServer = async (offerData) => {
    if (!stream) {
      logMessage("Получен offer, но камера выключена. Включаем...");
      await mediaGet();
    }
    
    createPeerConnection();

    try {
      const offer = JSON.parse(offerData);
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      logMessage("Answer создан, отправляем серверу...");
      sendMessage({ event: 'answer', data: JSON.stringify(answer) });
    } catch (e) {
      logMessage(`Критическая ошибка при обработке offer: ${e}`);
    }
  };
  
  // Обработчик для кандидатов от сервера
  const handleNewICECandidate = async (candidateData) => {
    if (pc.current && pc.current.remoteDescription) {
      try {
        const candidate = JSON.parse(candidateData);
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        logMessage(`Ошибка добавления ICE-кандидата: ${e}`);
      }
    } else {
      logMessage("Ошибка: получен кандидат до установки remoteDescription. Кандидат проигнорирован.");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">WebRTC Трансляция</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Video mediaGet={mediaGet} ref={localVideoRef} stream={stream} />
        <RemoteVideo stream={remoteStream}/>
      </div>
      <Logs logs={logs}/>
    </div>
  );
};