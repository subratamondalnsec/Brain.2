import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Common/Sidebar';
import CameraCapture from '../components/Models/CameraCapture';
import { ImageModel } from '../components/Models/ImageModel';
import ChatHeader from '../components/Common/ChatHeader';
import SendChat from '../components/SendAsk/SendChat';
import AskChat from '../components/SendAsk/AskChat';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState('send'); // 'send' or 'ask'
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const timerRef = useRef(null);
  const recordingTimeRef = useRef(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [fullScreenImage, setFullScreenImage] = useState(null);
  const playingAudioRef = useRef(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  const [stagedFile, setStagedFile] = useState(null);

  const [chatHistory, setChatHistory] = useState([
    { id: 1, role: 'assistant', type: 'text', content: `Neural link established. Welcome back, ${user?.fullName?.split(' ')[0] || 'Explorer'}. I've synthesized your recent activity into the core memory node.` }
  ]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          recordingTimeRef.current = prev + 1;
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const userMsg = { 
          id: Date.now(), 
          role: 'user', 
          type: 'audio', 
          url: audioUrl,
          duration: recordingTimeRef.current 
        };
        
        setChatHistory(prev => [...prev, userMsg]);
        
        setTimeout(() => {
          setChatHistory(prev => [...prev, { 
            id: Date.now() + 1, 
            role: 'assistant', 
            type: 'text',
            content: "Audio context successfully saved to your memory and analyzed." 
          }]);
        }, 1500);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing mic: ", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera");
      setShowCamera(false);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      
      setStagedFile({ 
        type: 'image', 
        url: dataUrl, 
        name: 'camera-photo.jpg' 
      });
      closeCamera();
    }
  };

  const handleAttachClick = (type) => {
    setShowAttachMenu(false);
    if (type === 'image') imageInputRef.current?.click();
    else if (type === 'document') docInputRef.current?.click();
    else if (type === 'camera') openCamera();
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create object URL to display natively
    const url = URL.createObjectURL(file);
    const msgType = type === 'document' ? 'document' : 'image';
    
    setStagedFile({ 
      type: msgType, 
      url, 
      name: file.name,
      file
    });
    
    e.target.value = null;
  };

  const toggleAudioPlay = (url, id) => {
    if (playingAudioId === id) {
        playingAudioRef.current?.pause();
        setPlayingAudioId(null);
    } else {
        if (playingAudioRef.current) {
            playingAudioRef.current.pause();
        }
        const audio = new Audio(url);
        playingAudioRef.current = audio;
        setPlayingAudioId(id);
        
        audio.onended = () => {
            setPlayingAudioId(null);
        };
        audio.play().catch(e => console.error("Playback failed: ", e));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() && !stagedFile) return;
    
    if (stagedFile) {
      const userMsg = { 
        id: Date.now(), 
        role: 'user', 
        type: stagedFile.type, 
        url: stagedFile.url, 
        name: stagedFile.name,
        content: message.trim() || undefined
      };
      setChatHistory(prev => [...prev, userMsg]);
      setStagedFile(null);
      setMessage('');
      
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          id: Date.now() + 1, 
          role: 'assistant', 
          type: 'text',
          content: stagedFile.type === 'image'
            ? "Image analyzed. Visual context successfully saved to your memory." 
            : `Document '${stagedFile.name}' processed. Relevant information extracted to your neural core.`
        }]);
      }, 1500);
    } else {
      const userMsg = { id: Date.now(), role: 'user', type: 'text', content: message };
      setChatHistory(prev => [...prev, userMsg]);
      setMessage('');
      
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          id: Date.now() + 1, 
          role: 'assistant', 
          type: 'text',
          content: mode === 'ask' 
            ? "Brain analysis complete. I've identified 3 cross-connections in your neural archives related to this query." 
            : "Context captured. Memory node encrypted and distributed across the neural network."
        }]);
      }, 1500);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 font-sans overflow-hidden">
      <input type="file" accept="image/*,video/*" ref={imageInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
      <input type="file" accept=".pdf,.doc,.docx,.txt" ref={docInputRef} className="hidden" onChange={(e) => handleFileChange(e, 'document')} />
      
      {/* Camera Capture Modal */}
      <CameraCapture 
        showCamera={showCamera} 
        closeCamera={closeCamera} 
        videoRef={videoRef} 
        canvasRef={canvasRef} 
        capturePhoto={capturePhoto} 
      />
      
      {/* Full Screen Image Modal */}
      <ImageModel 
        fullScreenImage={fullScreenImage} 
        setFullScreenImage={setFullScreenImage} 
      />

      {/* Modular Sidebar System */}
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Chat Area */}
      <main className="flex-1 h-screen max-h-screen min-w-0 min-h-0 flex flex-col relative bg-[#030508] overflow-hidden">
        {/* Flashy Bottom Ambient Glow */}
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-linear-to-t from-[#348fc0]/20 to-transparent pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-[#348fc0]/40 blur-[100px] pointer-events-none z-0" />

        {/* Header System */}
        <ChatHeader 
          setSidebarOpen={setSidebarOpen} 
          mode={mode} 
          setMode={setMode} 
        />

        {/* Chat Body & Input */}
        {mode === 'send' ? (
          <SendChat 
            chatContainerRef={chatContainerRef}
            chatHistory={chatHistory}
            toggleAudioPlay={toggleAudioPlay}
            playingAudioId={playingAudioId}
            setFullScreenImage={setFullScreenImage}
            chatEndRef={chatEndRef}
            handleSendMessage={handleSendMessage}
            stagedFile={stagedFile}
            setStagedFile={setStagedFile}
            showAttachMenu={showAttachMenu}
            setShowAttachMenu={setShowAttachMenu}
            handleAttachClick={handleAttachClick}
            isRecording={isRecording}
            recordingTime={recordingTime}
            message={message}
            setMessage={setMessage}
            mode={mode}
            handleVoiceRecording={handleVoiceRecording}
          />
        ) : (
          <AskChat />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
