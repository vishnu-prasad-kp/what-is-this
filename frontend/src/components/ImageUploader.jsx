import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, Sparkles, X, ArrowRight, AlertCircle } from 'lucide-react';
import ScanLoading from './ScanLoading';
import CameraModal from './CameraModal';

// Sample pre-generated test images (SVG Data URLs)
const SAMPLE_IMAGES = [
  {
    name: 'Coffee Mug',
    label: '☕ Hot Coffee Mug',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450" fill="#0f172a"><rect width="100%" height="100%" fill="#1e293b"/><path d="M220 180 h160 v150 a50 50 0 0 1 -50 50 h-60 a50 50 0 0 1 -50 -50 z" fill="#f8fafc"/><path d="M380 220 h40 a35 35 0 0 1 35 35 v20 a35 35 0 0 1 -35 35 h-40" stroke="#f8fafc" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M260 140 q20 -30 0 -60" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M300 135 q20 -30 0 -60" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M340 140 q20 -30 0 -60" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="300" cy="260" r="18" fill="#6366f1"/></svg>`
  },
  {
    name: 'Potted Houseplant',
    label: '🪴 Potted Plant',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450" fill="#0f172a"><rect width="100%" height="100%" fill="#0f172a"/><polygon points="230,260 370,260 345,390 255,390" fill="#ea580c"/><rect x="220" y="240" width="160" height="25" rx="8" fill="#c2410c"/><path d="M300 240 Q250 140 200 160 Q240 220 300 240" fill="#10b981"/><path d="M300 240 Q350 130 400 150 Q360 220 300 240" fill="#059669"/><path d="M300 240 Q300 100 300 90 Q320 180 300 240" fill="#34d399"/></svg>`
  }
];

export default function ImageUploader({ onAnalyze, isAnalyzing, error }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSampleClick = (sample) => {
    const blob = new Blob([sample.svg], { type: 'image/svg+xml' });
    const file = new File([blob], `${sample.name.toLowerCase().replace(/\s+/g, '_')}.svg`, { type: 'image/svg+xml' });
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(blob));
  };

  const handleStartAnalysis = () => {
    if (selectedFile) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <div className="uploader-container">
      {/* Hero Header */}
      <div className="hero-section">
        <div className="hero-pill">
          <Sparkles size={16} />
          <span>Multimodal Vision Intelligence</span>
        </div>
        <h1 className="hero-title">
          What Is <span className="brand-gradient-text">This?</span>
        </h1>
        <p className="hero-subtitle">
          Snap a photo or upload an image. Our vision model instantly identifies the object, reveals what it's used for, and shares important safety guidance.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="glass-card upload-card">
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'var(--rose-400)',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!previewUrl ? (
          <div>
            {/* Hidden native inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              id="file-upload-input"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              id="camera-capture-input"
            />

            {/* Drop Zone */}
            <div
              className={`dropzone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              id="image-dropzone"
            >
              <div className="upload-icon-wrapper">
                <Upload size={32} />
              </div>
              <div className="upload-primary-text">Drop your image here, or browse</div>
              <div className="upload-secondary-text">Supports JPEG, PNG, WebP up to 10MB</div>

              {/* Action Buttons */}
              <div className="upload-buttons-row" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  id="btn-upload-image"
                >
                  <ImageIcon size={18} />
                  <span>Upload Image</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                      setIsCameraModalOpen(true);
                    } else if (cameraInputRef.current) {
                      cameraInputRef.current.click();
                    }
                  }}
                  id="btn-scan-camera"
                >
                  <Camera size={18} />
                  <span>Scan Something</span>
                </button>
              </div>
            </div>

            {/* Sample Images Shelf for quick testing */}
            <div className="sample-shelf">
              <span className="sample-shelf-label">Or try a test subject:</span>
              {SAMPLE_IMAGES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="sample-chip"
                  onClick={() => handleSampleClick(sample)}
                  id={`sample-chip-${idx}`}
                >
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Preview Mode with Scanning HUD */
          <div className="preview-card">
            <div className="preview-media-container">
              <img src={previewUrl} alt="Subject preview" className="preview-img" id="preview-image-element" />
              {isAnalyzing && <ScanLoading />}
            </div>

            <div className="preview-actions">
              <div className="preview-info">
                <span className="preview-filename">{selectedFile?.name || 'Selected Object'}</span>
                {selectedFile?.size && (
                  <span className="preview-badge">
                    {(selectedFile.size / 1024).toFixed(0)} KB
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleClear}
                  disabled={isAnalyzing}
                  id="btn-clear-preview"
                >
                  <X size={16} />
                  <span>Remove</span>
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing}
                  id="btn-identify-object"
                >
                  <Sparkles size={18} />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Identify Object'}</span>
                  {!isAnalyzing && <ArrowRight size={18} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Camera Viewfinder Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(file) => handleFile(file)}
      />
    </div>
  );
}
