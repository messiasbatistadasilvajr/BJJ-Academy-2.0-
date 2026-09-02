import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, RefreshCw, Check, Sparkles, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoTaken: (photoUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onPhotoTaken,
  title = 'Foto de Presença no Tatame',
  subtitle = 'Tire sua selfie do treino para registrar sua frequência e feed',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  // Start camera when opened
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    if (isOpen && !capturedImage) {
      const startCamera = async () => {
        try {
          setCameraError(null);
          const constraints: MediaStreamConstraints = {
            video: {
              facingMode: isFrontCamera ? 'user' : 'environment',
              width: { ideal: 720 },
              height: { ideal: 960 },
            },
            audio: false,
          };
          const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          currentStream = mediaStream;
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err: unknown) {
          console.warn('Camera access error:', err);
          setCameraError('Câmera indisponível no navegador ou permissão negada. Você pode usar a simulação do tatame abaixo!');
        }
      };
      startCamera();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, isFrontCamera, capturedImage]);

  // Clean up on unmount or close
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    onClose();
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        // Stop stream after capture
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    } else {
      // Fallback sample photo
      simulatePhoto();
    }
  };

  const simulatePhoto = () => {
    // High quality BJJ martial arts training photo
    const sample = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';
    setCapturedImage(sample);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onPhotoTaken(capturedImage);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 text-slate-100 shadow-2xl flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Capacitor Camera API
              </span>
              <h3 className="text-sm font-bold text-white">{title}</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 my-2 shrink-0">{subtitle}</p>

          {/* Viewfinder / Capture Box */}
          <div className="relative w-full aspect-[3/4] rounded-2xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center my-2 shadow-inner">
            <canvas ref={canvasRef} className="hidden" />

            {capturedImage ? (
              <div className="relative w-full h-full">
                <img
                  src={capturedImage}
                  alt="Tatame selfie"
                  className="w-full h-full object-cover"
                />
                {/* Overlay BJJ Academy Watermark Badge */}
                <div className="absolute inset-x-3 bottom-3 p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-extrabold text-white tracking-wider">
                        BJJ ACADEMY • TREINO PAGO 🥋
                      </div>
                      <div className="text-[9px] text-red-400 font-semibold">
                        {new Date().toLocaleDateString('pt-BR')} • Tatame 1 • OSS!
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-red-600 text-[10px] font-bold text-white">
                      PRESENÇA OK
                    </span>
                  </div>
                </div>
              </div>
            ) : cameraError ? (
              <div className="p-4 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  {cameraError}
                </p>
                <button
                  onClick={simulatePhoto}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg transition"
                >
                  Usar Foto Modelo do Tatame
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
                {/* Target overlay guide */}
                <div className="absolute inset-8 border-2 border-dashed border-white/40 rounded-3xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-red-500" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-red-500" />
                  </div>
                  <div className="text-center text-[11px] text-white/80 font-medium bg-black/40 py-1 px-3 rounded-full backdrop-blur-sm mx-auto">
                    Enquadre seu rosto ou a turma no tatame
                  </div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-red-500" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-red-500" />
                  </div>
                </div>

                {/* Flip camera button */}
                <button
                  onClick={() => setIsFrontCamera(prev => !prev)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80"
                  title="Inverter Câmera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-3 border-t border-slate-800 shrink-0 flex gap-2">
            {capturedImage ? (
              <>
                <button
                  onClick={() => setCapturedImage(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Tirar Outra
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30"
                >
                  <Check className="w-4 h-4" /> Confirmar Foto
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={simulatePhoto}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  title="Usar foto de amostra"
                >
                  Amostra
                </button>
                <button
                  onClick={takePhoto}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-red-900/30"
                >
                  <Camera className="w-4 h-4" /> Capturar Foto (Capacitor)
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
