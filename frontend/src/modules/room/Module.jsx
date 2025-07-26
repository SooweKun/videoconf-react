/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { Video } from './components/video';
import { RemoteVideo } from './components/remote-video';
import { Logs } from './components/logs';

export const RoomModule = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [logs, setLogs] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef(null);
  const localVideoPlaceholderRef = useRef(null);
  
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const wsRef = useRef(null);

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
        
        const video = document.createElement('video');
        video.srcObject = event.streams[0];
        video.autoplay = true;
        video.controls = true;
        video.className = 'w-full rounded-lg';
        if (remoteVideosRef.current) {
          remoteVideosRef.current.appendChild(video);
        }
        
        addLog(`Received remote ${event.track.kind} track`);
        
        event.track.onmute = () => video.play();
        event.streams[0].onremovetrack = () => {
          if (video.parentNode) {
            video.parentNode.removeChild(video);
            addLog('Remote track removed');
          }
        };
      };

      const ws = new WebSocket('ws://127.0.0.1:6069/api/websocket');
      
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
        if (e.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ event: 'candidate', data: JSON.stringify(e.candidate) }));
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
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.classList.remove('hidden');
      }
      
      if (localVideoPlaceholderRef.current) {
        localVideoPlaceholderRef.current.classList.add('hidden');
      }
      
      if (pcRef.current) {
        stream.getTracks().forEach((track) => {
          pcRef.current.addTrack(track, stream);
          addLog(`Added ${track.kind} track`);
        });
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
        localVideoRef.current.classList.add('hidden');
      }
      
      if (localVideoPlaceholderRef.current) {
        localVideoPlaceholderRef.current.classList.remove('hidden');
      }
      
      addLog('Camera stopped');
    }
    
    setIsCameraOn(false);
  };

  useEffect(() => {
    initializeWebRTC();
    
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pcRef.current) pcRef.current.close();
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-gray-100 font-sans">
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">WebRTC Video Chat</h1>
        <Video isCameraOn={isCameraOn} toggleCamera={toggleCamera} ref={localVideoRef} wsConnected={wsConnected}/>
        <RemoteVideo ref={remoteVideosRef}/>
        <Logs logs={logs}/>
      </div>
    </div>
  );
};
