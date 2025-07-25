import { useState } from "react"
import { Logs } from "./components/logs"
import { RemoteVideo } from "./components/remote-video"
import { Video } from "./components/video"
import { useRef, useEffect } from "react"


const wsUrl = `ws://127.0.0.1:6069/api/websocket`;

export const RoomModule = () => {
//     const [isCameraOn, setIsCameraOn] = useState(false);
//     const [logs, setLogs] = useState([]);
//     const [remoteStreams, setRemoteStreams] = useState([]);

//     const pcRef = useRef(null);
//     const wsRef = useRef(null);
//     const localStreamRef = useRef(null);
//     const localVideoRef = useRef(null);
//     const initialized = useRef(false);

//     const logMessage = useCallback((message) => {

//     setLogs((prevLogs) => [
//     ...prevLogs,
//     `[${new Date().toLocaleTimeString()}] ${message}`,
//     ]);
//     }, []);

//     const initializeWebRTC = useCallback(() => {
//     //Создание RTCPeerConnection
//         const pc = new RTCPeerConnection({
//         iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//         });
//         pcRef.current = pc; // Сохраняем в реф

//         //Обработчик события 'ontrack'
//         //Срабатывает, когда от удаленного пира приходит медиапоток (аудио или видео).
//         pc.ontrack = (event) => {
//         if (event.track.kind === 'audio') return; // Игнорируем аудиодорожки для видеоэлементов
//         logMessage(`Получен удаленный трек: ${event.track.kind}`);
        
//         //Добавляем новый поток в состояние, что вызовет перерисовку
//         //и отображение нового видеоэлемента.
//         setRemoteStreams((prevStreams) => [...prevStreams, event.streams[0]]);

//         // Обработчики для управления воспроизведением и удалением
//         event.track.onmute = () => event.target.play();
//         event.streams[0].onremovetrack = () => {
//             logMessage('Удаленный трек был удален');
//             // Удаляем поток из состояния, когда он завершается.
//             setRemoteStreams((prevStreams) =>
//             prevStreams.filter((stream) => stream.id !== event.streams[0].id)
//             );
//         };
//         };

//         // 3. Создание и настройка WebSocket
//         const ws = new WebSocket(wsUrl);
//         wsRef.current = ws; // Сохраняем в реф

//         ws.onopen = () => logMessage('WebSocket соединение открыто');
//         ws.onclose = () => {
//         logMessage('WebSocket соединение закрыто');
//         alert('WebSocket соединение закрыто');
//         };
//         ws.onerror = (evt) => logMessage('WebSocket ошибка: ' + evt.type);

//         //Обработчик ICE-кандидатов
//         //Когда RTCPeerConnection находит способ соединения (кандидат),
//         //его нужно отправить другому пиру через сигнальный сервер (WebSocket).
//         pc.onicecandidate = (e) => {
//         if (e.candidate) {
//             ws.send(JSON.stringify({ event: 'candidate', data: JSON.stringify(e.candidate) }));
//             logMessage('Отправлен ICE-кандидат');
//         }
//         };
    
//     //Обработчик входящих сообщений от WebSocket
// // Обработчик входящих сообщений от WebSocket
// ws.onmessage = async (evt) => {
//   // Добавляем эту проверку в самое начало!
//   const pc = pcRef.current;
//   if (!pc || pc.signalingState === 'closed') {
//     logMessage('Соединение уже закрыто, игнорируем входящее сообщение.');
//     return;
//   }

//   try {
//     const msg = JSON.parse(evt.data);
//     if (!msg) {
//       logMessage('Получено пустое сообщение');
//       return;
//     }

//     switch (msg.event) {
//       // Получен 'offer' от другого пира
//       case 'offer': {
//         logMessage('Получен Offer');
//         const offer = JSON.parse(msg.data);
        
//         // Добавляем проверки состояния перед асинхронными операциями
//         if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
//             logMessage(`Неверное состояние для получения offer: ${pc.signalingState}`);
//             return;
//         }

//         await pc.setRemoteDescription(new RTCSessionDescription(offer));
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
        
//         // Проверяем, что WebSocket все еще открыт перед отправкой
//         if (ws.readyState === WebSocket.OPEN) {
//             ws.send(JSON.stringify({ event: 'answer', data: JSON.stringify(answer) }));
//             logMessage('Отправлен Answer');
//         }
//         break;
//       }
//       // Получен 'candidate' от другого пира
//       case 'candidate': {
//         logMessage('Получен ICE-кандидат');
//         const candidate = JSON.parse(msg.data);
//         // Здесь проверка уже сработает благодаря блоку в начале
//         await pc.addIceCandidate(new RTCIceCandidate(candidate));
//         break;
//       }
//       default:
//         logMessage('Неизвестное событие: ' + msg.event);
//     }
//   } catch (e) {
//     // Добавим проверку и сюда, чтобы не логировать ошибки для закрытых соединений
//     if (pc.signalingState !== 'closed') {
//         logMessage('Ошибка обработки сообщения: ' + e);
//     }
//   }
// };
//   }, [logMessage]); 

//   useEffect(() => {
//         // Проверяем, была ли уже инициализация
//         if (initialized.current) {
//             return;
//         }
//         initialized.current = true; // <--- Устанавливаем флаг

//         logMessage('Initializing WebRTC and WebSocket...');
//         initializeWebRTC();

//         // Функция очистки остается той же
//         return () => {
//             logMessage('Очистка ресурсов...');
//             if (localStreamRef.current) {
//                 localStreamRef.current.getTracks().forEach((track) => track.stop());
//             }
//             if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//                 wsRef.current.close();
//             }
//             if (pcRef.current) {
//                 pcRef.current.close();
//             }
//             // Можно сбросить флаг, если компонент действительно размонтируется
//             // но для Strict Mode лучше оставить его как есть.
//         };
//     }, [initializeWebRTC, logMessage]); // <--- Зависимости оставляем


//     const handleToggleCamera = async () => {
//     if (isCameraOn) {
//       // --- Логика выключения камеры ---
//       logMessage('Остановка камеры...');
//       // Останавливаем все треки в потоке
//       localStreamRef.current.getTracks().forEach((track) => {
//         track.stop();
//         // Находим и удаляем соответствующий sender из RTCPeerConnection
//         const sender = pcRef.current.getSenders().find((s) => s.track === track);
//         if (sender) {
//           pcRef.current.removeTrack(sender);
//         }
//       });
      
//       // Очищаем поток и видеоэлемент
//       localStreamRef.current = null;
//       if(localVideoRef.current) localVideoRef.current.srcObject = null;
      
//       setIsCameraOn(false); // Обновляем состояние
//     } else {
//       // --- Логика включения камеры ---
//       try {
//         logMessage('Запуск камеры...');
//         // Запрашиваем доступ к камере и микрофону
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
//         // Сохраняем поток и отображаем его в локальном видео
//         localStreamRef.current = stream;
//         if(localVideoRef.current) localVideoRef.current.srcObject = stream;
        
//         // Добавляем треки из потока в RTCPeerConnection для отправки другому пиру
//         stream.getTracks().forEach((track) => {
//           pcRef.current.addTrack(track, stream);
//           logMessage(`Добавлен локальный трек: ${track.kind}`);
//         });

//         setIsCameraOn(true); 
//       } catch (e) {
//         logMessage('Не удалось получить доступ к медиа-устройствам: ' + e);
//         alert('Не удалось получить доступ к камере: ' + e.message);
//       }
//     }
//   };

    // return (
    //     <div className="container mx-auto p-4 max-w-4xl">
    //         <h1 className="text-2xl font-bold text-gray-800 mb-4">WebRTC Video Chat</h1>
    //         <Video ref={localVideoRef} handleToggleCamera={handleToggleCamera}/>
    //         {remoteStreams.map((stream) => (
    //             <RemoteVideo key={stream.id} stream={stream} />
    //         ))}
    //         <Logs logs={logs}/>
    //     </div>
    // )

  const [logs, setLogs] = useState([]);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const isConnectedRef = useRef(false)
  const socketRef = useRef(null);
  const videoRef = useRef(null);
  const pc = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(isConnectedRef, "connected");
      setLogs(prevLogs => [...prevLogs, "соединение установлено"]);
      isConnectedRef.current = true;
    };

    socket.onmessage = (e) => {
      console.log("WebSocket сообщение:", e.data);
      setLogs(prevLogs => [...prevLogs, "получен оффер с кандидатами"]);
      const message = JSON.parse(e.data); //парсим данные с ответов 

      console.log("WebSocket сообщение получено, тип:", message.type);

      switch (message.type) {
        case 'offer':
          setLogs(prevLogs => [...prevLogs, "получен offer от другого пира"]);
          handleOffer(message.sdp); 
          break;
        
        case 'answer':
          setLogs(prevLogs => [...prevLogs, "получен answer от другого пира"]);
          handleAnswer(message.sdp); 
          break;

        case 'ice-candidate':
          handleNewICECandidate(message.candidate);
          break;
          
        default:
          console.warn('Неизвестный тип сообщения от WebSocket');
      }
    };

    socket.onclose = () => {
      setLogs(prevLogs => [...prevLogs, "соединение закрыто"]);
      isConnectedRef.current = false;
    };

    socket.onerror = (error) => {
      console.error("WebSocket ошибка:", error);
      setLogs(prevLogs => [...prevLogs, "ошибка соединения"]);
    };

    return () => {
      console.log("Закрываем WebSocket соединение");
    };

  }, [])

  useEffect(() => {

    return () => {

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log("Компонент размонтирован, камера выключена.");
      }

    };
  }, [stream]);

  useEffect(() => {

    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    
  }, [stream]); 

  const mediaGet = async () => {

    try {

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true 
      });
      setLogs(prevLogs => [...prevLogs, "медиа получен"]);
      console.log(stream, "stream");
      setStream(mediaStream);

    } catch(err) {
      console.log(err, "медиа");
      setLogs(prevLogs => [...prevLogs, "ошибка получения медиа"]);
    }

  }

  const stunServer = {
    iceServers: [
      {
      urls: 'stun:stun.l.google.com:19302'
      }
    ]
  }

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }

  const createPeerConnection = () => {

    if (pc.current) {
      pc.current.close();
    }
    
    const peerConnection = new RTCPeerConnection(stunServer);

    peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        setLogs(prev => [...prev, "Отправка ICE candidate..."]);
        sendMessage({ type: 'ice-candidate', candidate: e.candidate });
      }
    }

    peerConnection.ontrack = (event) => {
      setLogs(prev => [...prev, "Получен удаленный трек!"]);
      setRemoteStream(event.streams[0]);
    };

    if (stream) {
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      setLogs(prev => [...prev, "Локальные треки добавлены в PeerConnection"]);
    }

    pc.current = peerConnection;

  }

  const Call = async () => {

    if (!stream) {
      alert("Сначала включите камеру!");
      return;
    }

    setLogs(prev => [...prev, "Начинаем звонок..."]);
    createPeerConnection();

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    setLogs(prev => [...prev, "Offer создан, отправляем..."]);
    sendMessage({ type: 'offer', sdp: pc.current.localDescription });
  }

  const handleOffer = async (offer) => {
    if (!stream) {
      await mediaGet(); 
    }

    createPeerConnection();
    await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);

    setLogs(prev => [...prev, "Answer создан, отправляем..."]);
    sendMessage({ type: 'answer', sdp: pc.current.localDescription });
  }

  const handleAnswer = async (answer) => {
    await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
    setLogs(prev => [...prev, "Соединение установлено!"]);
  };

  const handleNewICECandidate = async (candidate) => {
    if (pc.current && candidate) {
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Ошибка добавления ICE candidate:", e);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">WebRTC Video Chat</h1>
      <Video mediaGet={mediaGet} ref={videoRef} stream={stream} Call={Call}/>
        <RemoteVideo remoteStream={remoteStream}/>
      <Logs logs={logs}/>
    </div>
  )
}