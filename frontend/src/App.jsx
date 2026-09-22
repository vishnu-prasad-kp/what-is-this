import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import RecentScans from './components/RecentScans';
import { analyzeImage, getHistory, getScan, deleteScan, getStatus } from './services/api';

export default function App() {
  const [currentResult, setCurrentResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(null);

  // Load initial status and history
  const loadInitialData = async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        getStatus(),
        getHistory(12)
      ]);
      if (statusRes) setStatus(statusRes);
      if (historyRes?.items) setHistory(historyRes.items);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleAnalyze = async (file) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeImage(file);
      setCurrentResult(result);
      // Refresh history
      const updatedHistory = await getHistory(12);
      if (updatedHistory?.items) {
        setHistory(updatedHistory.items);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during image analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectScan = async (scanId) => {
    try {
      const scan = await getScan(scanId);
      setCurrentResult(scan);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Could not open scan record: ' + err.message);
    }
  };

  const handleDeleteScan = async (scanId) => {
    try {
      await deleteScan(scanId);
      setHistory(prev => prev.filter(item => item.id !== scanId));
      if (currentResult?.id === scanId) {
        setCurrentResult(null);
      }
    } catch (err) {
      alert('Could not delete scan: ' + err.message);
    }
  };

  const handleResetToHome = () => {
    setCurrentResult(null);
    setError(null);
  };

  return (
    <div className="app-wrapper">
      <Navbar status={status} onHomeClick={handleResetToHome} />

      <main className="main-content">
        {!currentResult ? (
          <>
            <ImageUploader 
              onAnalyze={handleAnalyze} 
              isAnalyzing={isAnalyzing} 
              error={error} 
            />
            <RecentScans 
              history={history} 
              onSelectScan={handleSelectScan} 
              onDeleteScan={handleDeleteScan} 
            />
          </>
        ) : (
          <AnalysisResult 
            result={currentResult} 
            onScanAnother={handleResetToHome} 
          />
        )}
      </main>
    </div>
  );
}
