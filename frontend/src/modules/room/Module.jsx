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
  const pc = useRef(null); // PeerConnection

  const logMessage = (message) => {
    console.log(message);
    setLogs(prevLogs => [...prevLogs, message]);
  };

  useEffect(() => {
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      logMessage("WebSocket: Соединение установлено");
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
          logMessage("Получен 'offer'");
          handleOffer(msg.data);
          break;
        case 'answer':
          logMessage("Получен 'answer'");
          handleAnswer(msg.data);
          break;
        case 'candidate':
          handleNewICECandidate(msg.data);
          break;
        default:
          logMessage(`Неизвестное событие: ${msg.event}`);
      }
    };

    socket.onclose = () => logMessage("WebSocket: Соединение закрыто");
    socket.onerror = (error) => logMessage(`WebSocket: Ошибка - ${error}`);

    return () => {
      console.log("Закрываем WebSocket соединение");
    };
  }, []);

  const mediaGet = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      logMessage("Медиа-поток получен");
      setStream(mediaStream);
    } catch (err) {
      logMessage(`Ошибка получения медиа: ${err}`);
    }
  };
  
  useEffect(() => {
    if (stream && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);


  const stunServer = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  const createPeerConnection = () => {
    if (pc.current) pc.current.close();
    
    const peerConnection = new RTCPeerConnection(stunServer);
    
    peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        // Отправляем кандидата в формате { event: 'candidate', data: '...' }
        sendMessage({ event: 'candidate', data: JSON.stringify(e.candidate) });
      }
    };

    peerConnection.ontrack = (event) => {
      logMessage("Получен удаленный трек!");
      setRemoteStream(event.streams[0]);
    };

    if (stream) {
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      logMessage("Локальные треки добавлены в PeerConnection");
    }

    pc.current = peerConnection;
  };
  
  // ИНИЦИАТОР: Начать звонок
  const handleCall = async () => {
    if (!stream) return alert("Сначала включите камеру!");
    
    logMessage("Инициируем звонок...");
    createPeerConnection();
    
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    
    logMessage("Offer создан, отправляем...");
    sendMessage({ event: 'offer', data: JSON.stringify(offer) });
  };

  // ОТВЕЧАЮЩИЙ: Обработать входящий offer
  const handleOffer = async (offerData) => {
    try {
      const offer = JSON.parse(offerData);
      createPeerConnection();
      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      
      logMessage("Answer создан, отправляем...");
      sendMessage({ event: 'answer', data: JSON.stringify(answer) });
    } catch (e) {
      logMessage(`Ошибка обработки offer: ${e}`);
    }
  };

  // ИНИЦИАТОР: Обработать входящий answer
  const handleAnswer = async (answerData) => {
    try {
      const answer = JSON.parse(answerData);
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
      logMessage("Соединение установлено!");
    } catch (e) {
      logMessage(`Ошибка обработки answer: ${e}`);
    }
  };
  
  // ОБА ПИРА: Добавить ICE-кандидата
  const handleNewICECandidate = async (candidateData) => {
    try {
      const candidate = JSON.parse(candidateData);
      await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch  {
      console.log("Ошибка добавления ICE-кандидата");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">WebRTC Video Chat</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Передаем handleCall в компонент Video, чтобы повесить на кнопку */}
        <Video mediaGet={mediaGet} ref={localVideoRef} stream={stream} Call={handleCall}/>
        <RemoteVideo stream={remoteStream}/>
      </div>
      <Logs logs={logs}/>
    </div>
  );
};