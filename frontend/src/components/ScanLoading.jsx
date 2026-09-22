import React, { useState, useEffect } from 'react';

const STEPS = [
  'Extracting visual contours & lighting...',
  'Querying Groq Llama 3.2 Vision engine...',
  'Classifying primary object & confidence...',
  'Synthesizing practical uses & safety notes...',
  'Structuring final intelligence...'
];

export default function ScanLoading() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="scanner-overlay" id="scanner-loading-overlay">
      <div className="laser-line" />
      <div className="radar-spinner" />
      <div className="scanner-status-text">Analyzing Object</div>
      <div className="scanner-step-subtext">{STEPS[stepIndex]}</div>
    </div>
  );
}
