/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { Video } from './components/video';
import { RemoteVideo } from './components/remote-video';
import { Logs } from './components/logs';
import { Rooms } from './components/rooms';



export const RoomModule = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [logs, setLogs] = useState<String[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [userId, setUserId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  // const remoteVideosRef = useRef(null);
  const localVideoPlaceholderRef = useRef<HTMLVideoElement>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

      const handleRoomSelect = (roomId) => {
        setSelectedRoomId(roomId); 
    };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const initializeWebRTC = () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      pc.ontrack = (event) => {
        if (event.track.kind === 'audio') return;
  
        setRemoteStreams(prev => [...prev, event.streams[0]]);
        addLog(`Received remote ${event.track.kind} track`);
      };

      const ws = new WebSocket(`wss://192.168.101.33:6069/api/websocket?userID=${userId}&hubID=${selectedRoomId}`);

      ws.onopen = () => {
        addLog('WebSocket opened');
        setWsConnected(true);
      };

      ws.onclose = () => {
        addLog('WebSocket closed');
        setWsConnected(false);
      };

      ws.onerror = (evt) => {
        addLog('WebSocket error: ' + evt);
        setWsConnected(false);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && wsConnected) {
          ws.send(JSON.stringify({ event: 'candidate', data: JSON.stringify(e.candidate) }));
          addLog('Sent ICE candidate');
        }
      };

      ws.onmessage = async (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (!msg) {
            addLog('Empty message received');
            return;
          }

          switch (msg.event) {
            case 'offer': {
              let offer = JSON.parse(msg.data);
              if (!offer) {
                addLog('Empty offer received');
                return;
              }
              await pc.setRemoteDescription(offer);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify({ event: 'answer', data: JSON.stringify(answer) }));
              addLog('Sent answer');
              break;
            }
            case 'candidate': {
              const candidate = JSON.parse(msg.data);
              if (!candidate) {
                addLog('Empty candidate received');
                return;
              }
              await pc.addIceCandidate(candidate);
              addLog('Added ICE candidate');
              break;
            }
            case 'answer': {
              const answer = JSON.parse(msg.data);
              await pc.setRemoteDescription(new RTCSessionDescription(answer));
              addLog('Set remote description from answer');
              break;
            }
            default:
              addLog('Unknown event: ' + msg.event);
          }
        } catch (e) {
          addLog('Failed to parse message: ' + e);
        }
      };

      pcRef.current = pc;
      wsRef.current = ws;

      return () => {
        console.log('Закрываем WebRTC соединение');
      };
    } catch (error) {
      addLog('Failed to initialize WebRTC: ' + error.message);
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      if (pcRef.current) {
        stream.getTracks().forEach((track) => {
          pcRef.current && 
          pcRef.current.addTrack(track, stream);
          addLog(`Added ${track.kind} track`);
        });
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsCameraOn(true);
      addLog('Camera started');
    } catch (e) {
      addLog('Failed to get media devices: ' + e);
      alert('Failed to access camera: ' + e.message);
    }
  };

  const stopCamera = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        if (pcRef.current) {
          const sender = pcRef.current.getSenders().find((s) => s.track === track);
          if (sender) pcRef.current.removeTrack(sender);
        }
      });
      streamRef.current = null;


      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      addLog('Camera stopped');
    }

    setIsCameraOn(false);
  };

  useEffect(() => {
     if (!userId || !selectedRoomId) {
      return; 
    }

    initializeWebRTC();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pcRef.current) pcRef.current.close();
      stopCamera();
    };
  }, [userId, selectedRoomId]);

  return (
    <div className="bg-gray-100 font-sans h-screen">
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800">WebRTC Video Chat</h1>
        <Rooms handleRoomSelect={handleRoomSelect} setUserId={setUserId}/>
        <div className='flex justify-between mt-4'>
          <Video isCameraOn={isCameraOn} toggleCamera={toggleCamera} ref={localVideoRef} wsConnected={wsConnected}/>
          <RemoteVideo remoteStreams={remoteStreams}/>
        </div>
        <Logs logs={logs}/>
      </div>
    </div>
  );
};
