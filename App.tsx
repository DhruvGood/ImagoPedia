import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { InfoModal } from './components/InfoModal';
import { analyzeImage } from './services/geminiService';
import type { Mode, Identification } from './types';
import { CameraIcon, ErrorIcon, LoadingIcon } from './components/Icons';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('Normal');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [identifications, setIdentifications] = useState<Identification[]>([]);
  const [selectedIdentification, setSelectedIdentification] = useState<Identification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const setupCamera = useCallback(async (camMode: 'environment' | 'user') => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: camMode } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setImagePreview(null);
      setIdentifications([]);
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please grant permission and refresh.");
    }
  }, [cameraStream]);

  useEffect(() => {
    setupCamera(facingMode);
    
    return () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCameraToggle = () => {
      const newMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newMode);
      setupCamera(newMode);
  };

  const handleCameraReset = () => {
    // Re-initialize the camera with the current facing mode
    setupCamera(facingMode);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIdentifications([]);
        handleAnalysis(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = useCallback(async (base64Image?: string) => {
    setIsProcessing(true);
    setIdentifications([]);
    setError(null);

    let imageSrc = base64Image;

    if (!imageSrc && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        imageSrc = canvas.toDataURL('image/jpeg');
      }
    }

    if (!imageSrc) {
      setError("Could not capture an image to analyze.");
      setIsProcessing(false);
      return;
    }

    try {
      const results = await analyzeImage(imageSrc, mode);
      setIdentifications(results);
    } catch (err) {
      console.error("AI analysis failed:", err);
      setError("Failed to analyze the image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [mode]);

  const handleBoxClick = (id: Identification) => {
    setSelectedIdentification(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIdentification(null);
  };
  
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setIdentifications([]); // Clear old identifications on mode switch
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        onFileSelect={handleFileChange}
        isProcessing={isProcessing}
        onScan={() => handleAnalysis()}
        onCameraReset={handleCameraReset}
        onCameraToggle={handleCameraToggle}
      />
      
      <canvas ref={canvasRef} className="hidden" />

      {imagePreview ? (
        <img src={imagePreview} alt="Uploaded preview" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
      )}

      {!cameraStream && !imagePreview && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
            <div className="text-center p-8 bg-gray-800 rounded-lg shadow-2xl">
                <CameraIcon className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h2 className="text-2xl font-bold mb-2">Camera Not Found</h2>
                {error ? (
                    <p className="text-red-400 max-w-sm">{error}</p>
                ) : (
                    <p className="text-slate-300 max-w-sm">Please enable camera access to begin exploring the world around you.</p>
                )}
                <button 
                    onClick={handleCameraReset} 
                    className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-800">
                    Retry Camera
                </button>
            </div>
        </div>
      )}

      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            <div className="flex flex-col items-center text-center p-4">
              <LoadingIcon className="w-12 h-12 mb-4" />
              <p className="text-lg font-semibold animate-pulse">AI is thinking...</p>
            </div>
        </div>
      )}

      {error && !isProcessing && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-red-500/80 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg z-20">
            <ErrorIcon className="w-6 h-6" />
            <p>{error}</p>
        </div>
      )}

      <div className="absolute inset-0 h-full w-full z-10">
        {identifications.map((id, index) => (
          <button
            key={index}
            className="absolute bg-white/30 backdrop-blur-sm border-2 border-white rounded-lg shadow-lg hover:bg-white/50 focus:bg-white/50 transition-all duration-300 focus:outline-none focus:ring-4 ring-blue-400"
            style={{
              left: `${id.boundingBox.x_min * 100}%`,
              top: `${id.boundingBox.y_min * 100}%`,
              width: `${(id.boundingBox.x_max - id.boundingBox.x_min) * 100}%`,
              height: `${(id.boundingBox.y_max - id.boundingBox.y_min) * 100}%`,
            }}
            onClick={() => handleBoxClick(id)}
            aria-label={`Details about ${id.name || id.issue}`}
          />
        ))}
      </div>

      {isModalOpen && selectedIdentification && (
        <InfoModal
          identification={selectedIdentification}
          mode={mode}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default App;