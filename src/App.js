// src/App.js
import React, { useState } from 'react';
import TranscriptForm from './components/TranscriptForm';
import Payment from './components/Payment';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handleTranscriptReady = (transcript) => {
    console.log('Transcript ready:', transcript);
    setTranscript(transcript);
  };

  const handlePaymentSuccess = (status) => {
    console.log('Payment status:', status);
    setPaymentStatus(status);
  };

  return (
    <div className="App">
      <div className="form-container">
        <h1>YouTube Transcriber and Translator</h1>
        <TranscriptForm onTranscriptReady={handleTranscriptReady} />
      </div>
      {transcript && !paymentStatus && <Payment onSuccess={handlePaymentSuccess} />}
      {paymentStatus && (
        <div>
          <h2>Transcript</h2>
          <p>{transcript}</p>
          <button onClick={() => window.location.reload()}>Transcribe Another Video</button>
        </div>
      )}
    </div>
  );
}

export default App;