import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, SwitchCamera, Check, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [flashActive, setFlashActive] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize camera when modal opens or facingMode changes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Webcam access is not supported in this browser or environment.');
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was detected on your system.');
      } else {
        // Fallback: try basic video constraint
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
          return;
        } catch (fbErr) {
          setCameraError('Could not start camera video stream: ' + (err.message || 'Unknown error'));
        }
      }
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Trigger flash animation
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Ensure canvas matches video resolution
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    
    // If front camera, flip horizontally for natural mirror image
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);
      setCapturedImage({ file, previewUrl });
    }, 'image/jpeg', 0.95);
  };

  const handleRetake = () => {
    if (capturedImage?.previewUrl) {
      URL.revokeObjectURL(capturedImage.previewUrl);
    }
    setCapturedImage(null);
  };

  const handleConfirmPhoto = () => {
    if (capturedImage?.file) {
      onCapture(capturedImage.file);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    if (capturedImage?.previewUrl) {
      URL.revokeObjectURL(capturedImage.previewUrl);
    }
    setCapturedImage(null);
    setCameraError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="camera-modal-backdrop" id="camera-modal-overlay">
      <div className="camera-modal-content glass-card">
        {/* Header */}
        <div className="camera-modal-header">
          <div className="camera-modal-title">
            <Camera size={20} color="var(--cyan-400)" />
            <span>AI Live Viewfinder</span>
          </div>
          <button 
            type="button" 
            className="btn-ghost" 
            onClick={handleClose} 
            id="btn-close-camera-modal"
            style={{ padding: '0.4rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Video / Snapshot Viewport */}
        <div className="camera-viewport-wrapper">
          {flashActive && <div className="camera-shutter-flash"></div>}

          {cameraError ? (
            <div className="camera-error-container">
              <AlertTriangle size={48} color="var(--amber-400)" />
              <p className="camera-error-message">{cameraError}</p>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={startCamera}
                id="btn-retry-camera"
              >
                <RotateCcw size={16} />
                <span>Retry Camera</span>
              </button>
            </div>
          ) : capturedImage ? (
            /* Frozen Snapshot Preview */
            <div className="camera-preview-snapshot">
              <img 
                src={capturedImage.previewUrl} 
                alt="Captured Subject" 
                className="camera-snapshot-img" 
                id="camera-captured-img"
              />
              <div className="camera-snapshot-overlay">
                <span className="camera-snapshot-badge">Snapshot Captured</span>
              </div>
            </div>
          ) : (
            /* Live Stream with HUD Reticle */
            <div className="camera-live-frame">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`camera-video-stream ${facingMode === 'user' ? 'mirrored' : ''}`}
                id="camera-video-element"
              />
              
              {/* Sci-Fi HUD Reticle */}
              <div className="camera-hud-overlay">
                <div className="hud-corner top-left"></div>
                <div className="hud-corner top-right"></div>
                <div className="hud-corner bottom-left"></div>
                <div className="hud-corner bottom-right"></div>
                <div className="hud-target-center"></div>
                <div className="hud-scan-beam"></div>
                <div className="hud-status-badge">
                  <span className="hud-pulse-dot"></span>
                  <span>AIM OBJECT AT CENTER</span>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas for Frame Processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Footer Controls */}
        <div className="camera-modal-footer">
          {capturedImage ? (
            <div className="camera-confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRetake}
                id="btn-retake-photo"
              >
                <RotateCcw size={16} />
                <span>Retake</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirmPhoto}
                id="btn-use-captured-photo"
              >
                <Sparkles size={16} />
                <span>Identify This Object</span>
              </button>
            </div>
          ) : (
            <div className="camera-live-actions">
              <button
                type="button"
                className="btn-secondary camera-switch-btn"
                onClick={handleSwitchCamera}
                title="Switch Camera (Front/Back)"
                id="btn-switch-camera"
                disabled={Boolean(cameraError)}
              >
                <SwitchCamera size={18} />
              </button>

              <button
                type="button"
                className="camera-shutter-btn"
                onClick={handleCaptureSnapshot}
                id="btn-capture-shutter"
                disabled={Boolean(cameraError)}
                title="Take Photo"
              >
                <div className="camera-shutter-inner"></div>
              </button>

              <div style={{ width: 44 }}></div> {/* Spacer to keep shutter centered */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
