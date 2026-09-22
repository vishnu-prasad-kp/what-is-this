import React, { useState, useEffect, useRef } from 'react';
import { 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  Layers, 
  ExternalLink,
  HelpCircle,
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User
} from 'lucide-react';
import { askScanQuestion } from '../services/api';

const QUICK_PROMPTS = [
  'How do I clean and maintain this?',
  'What are key safety warnings?',
  'Is this recyclable or eco-friendly?',
  'Where is this typically stored or used?'
];

export default function AnalysisResult({ result, onScanAnother }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Initialize Speech-to-Text
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setUserQuestion(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition warning:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Stop speech when unmounting or changing results
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [result, isListening]);

  if (!result) return null;

  // Text-To-Speech handler
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // cancel any ongoing speech

    const usesSpeech = result.uses && result.uses.length > 0 
      ? `Common uses include: ${result.uses.join(', ')}.` 
      : '';
    const safetySpeech = result.safety_note 
      ? `Safety note: ${result.safety_note}` 
      : '';

    const textToSpeak = `${result.name}. ${result.description} ${usesSpeech} ${result.important_info} ${safetySpeech}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Voice Input Speech-to-Text
  const handleToggleVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech-to-Text voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  // Follow-up question live handler
  const handleAskQuestion = async (customQuestion) => {
    const questionText = (typeof customQuestion === 'string' ? customQuestion : userQuestion).trim();
    if (!questionText || isAnswering) return;

    setUserQuestion('');
    setIsAnswering(true);

    const pendingIndex = qaHistory.length;
    setQaHistory(prev => [...prev, { q: questionText, a: null }]);

    try {
      let answer = '';
      if (result.id) {
        const res = await askScanQuestion(result.id, questionText);
        answer = res.answer;
      } else {
        answer = `Regarding ${result.name}: In most contexts, this is utilized for ${result.uses?.[0] || 'its primary purpose'}. ${result.important_info || ''}`;
      }

      setQaHistory(prev => {
        const updated = [...prev];
        updated[pendingIndex] = { q: questionText, a: answer };
        return updated;
      });
    } catch (err) {
      setQaHistory(prev => {
        const updated = [...prev];
        updated[pendingIndex] = { 
          q: questionText, 
          a: `Could not retrieve answer: ${err.message || 'Please try again.'}` 
        };
        return updated;
      });
    } finally {
      setIsAnswering(false);
    }
  };

  useEffect(() => {
    if (showQuestionModal && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [qaHistory, isAnswering, showQuestionModal]);

  const confidenceClass = result.confidence?.toLowerCase() || 'medium';

  return (
    <div className="result-layout" id="analysis-result-section">
      {/* Left: Image Card & Quick Actions */}
      <div className="result-image-panel">
        <div className="result-image-frame">
          <img src={result.image_url} alt={result.name} id="result-main-image" />
        </div>

        {/* Quick buttons under image */}
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button 
            type="button"
            className="btn-secondary" 
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onScanAnother}
            id="btn-scan-another-sidebar"
          >
            <RotateCcw size={16} />
            <span>Scan Another</span>
          </button>
        </div>
      </div>

      {/* Right: Detailed Structured Information Card */}
      <div className="glass-card result-details-card">
        {/* Header: Object Name and Confidence */}
        <div className="result-header">
          <div className="result-title-group">
            <div className="result-label-meta">Identified Object</div>
            <h2 className="object-name-heading" id="result-object-name">{result.name}</h2>
          </div>

          <div className={`confidence-pill ${confidenceClass}`} id="result-confidence-pill">
            <CheckCircle2 size={15} />
            <span>{result.confidence} Confidence</span>
          </div>
        </div>

        {/* What is it? (Description) */}
        <div className="info-section">
          <div className="section-caption">
            <span>What is it?</span>
          </div>
          <p className="section-text" id="result-description">{result.description}</p>
        </div>

        {/* Common Uses */}
        {result.uses && result.uses.length > 0 && (
          <div className="info-section">
            <div className="section-caption">
              <Layers size={16} color="var(--cyan-400)" />
              <span>Common Uses</span>
            </div>
            <div className="uses-grid" id="result-uses-list">
              {result.uses.map((use, idx) => (
                <div key={idx} className="use-chip">
                  <span className="use-chip-dot"></span>
                  <span>{use}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Information */}
        {result.important_info && (
          <div className="important-box" id="result-important-info-box">
            <Info size={22} className="important-icon" />
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                Important Information
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {result.important_info}
              </p>
            </div>
          </div>
        )}

        {/* Safety Note Alert Banner */}
        {result.safety_note && (
          <div className="safety-alert-box" id="result-safety-note-box">
            <ShieldAlert size={24} className="safety-icon" />
            <div>
              <div className="safety-title">Safety Advisory</div>
              <div className="safety-text">{result.safety_note}</div>
            </div>
          </div>
        )}

        {/* Action Buttons: Ask Question, Listen, Scan Another */}
        <div className="result-actions-bar">
          <button
            type="button"
            className={`btn-secondary ${isSpeaking ? 'btn-speech speaking' : ''}`}
            onClick={handleToggleSpeech}
            id="btn-listen-speech"
            title="Read description aloud"
          >
            {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowQuestionModal(true)}
            id="btn-ask-question"
          >
            <MessageSquare size={18} />
            <span>Ask a Question</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={onScanAnother}
            id="btn-scan-another-main"
            style={{ marginLeft: 'auto' }}
          >
            <RotateCcw size={18} />
            <span>Scan Another</span>
          </button>
        </div>
      </div>

      {/* Follow-up Question Modal / Drawer */}
      {showQuestionModal && (
        <div className="qa-modal-backdrop" id="qa-modal-overlay">
          <div className="glass-card qa-modal-card">
            <div className="qa-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MessageSquare size={20} color="var(--cyan-400)" />
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Ask about {result.name}</h3>
              </div>
              <button 
                onClick={() => setShowQuestionModal(false)}
                className="btn-ghost"
                style={{ padding: '0.35rem' }}
                id="btn-close-qa-modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="qa-chips-shelf">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="qa-prompt-chip"
                  onClick={() => handleAskQuestion(prompt)}
                  disabled={isAnswering}
                >
                  <Sparkles size={12} />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>

            {/* Q&A Thread */}
            <div className="qa-chat-thread" id="qa-chat-messages">
              {qaHistory.length === 0 ? (
                <div className="qa-empty-state">
                  Ask any follow-up question regarding how to use, maintain, store, or safely handle this object. You can type or use the voice microphone!
                </div>
              ) : (
                qaHistory.map((item, idx) => (
                  <div key={idx} className="qa-message-group">
                    {/* User Question */}
                    <div className="qa-user-message">
                      <div className="qa-message-text">{item.q}</div>
                    </div>
                    {/* AI Answer */}
                    <div className="qa-ai-message">
                      <div className="qa-ai-avatar">
                        <Bot size={15} color="var(--cyan-400)" />
                      </div>
                      <div className="qa-message-text">
                        {item.a ? (
                          item.a
                        ) : (
                          <span className="qa-typing-indicator">
                            <span>.</span><span>.</span><span>.</span> AI analyzing...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }} 
              className="qa-input-form"
            >
              <input
                type="text"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder={isListening ? 'Listening to your voice...' : `Ask anything about ${result.name}...`}
                className={`qa-text-input ${isListening ? 'listening' : ''}`}
                id="input-followup-question"
              />

              {/* Voice Input Button */}
              {speechSupported && (
                <button
                  type="button"
                  className={`btn-voice-input ${isListening ? 'active-listening' : ''}`}
                  onClick={handleToggleVoiceInput}
                  title={isListening ? 'Stop listening' : 'Voice input (Speak your question)'}
                  id="btn-voice-input-mic"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={!userQuestion.trim() || isAnswering}
                id="btn-submit-question"
                style={{ padding: '0.7rem 1.1rem' }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
