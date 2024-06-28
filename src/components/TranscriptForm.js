import React, { useState } from 'react';
import axios from 'axios';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { franc } from 'franc';
import './TranscriptForm.css';

const TranscriptForm = () => {
    const [url, setUrl] = useState('');
    const [message, setMessage] = useState('');
    const [transcript, setTranscript] = useState('');
    const [isPaymentReady, setIsPaymentReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isNonEnglish, setIsNonEnglish] = useState(false);
    const [translate, setTranslate] = useState(false);
    const [translationError, setTranslationError] = useState(false);
    const [paymentError, setPaymentError] = useState(false);
    const [showGetTranscriptButton, setShowGetTranscriptButton] = useState(true);
    const [transcriptionStarted, setTranscriptionStarted] = useState(false);

    const handleUrlChange = (e) => {
        setUrl(e.target.value);
    };

    const handleTranslateChange = async (e) => {
        const isChecked = e.target.checked;
        setTranslate(isChecked);

        if (isChecked && isNonEnglish && transcript) {
            try {
                setMessage(<div className="message-container">Translating transcript...</div>);
                const translatedTranscript = await translateTranscript(transcript);
                setTranscript(translatedTranscript);
                setMessage(<div className="message-container">Translation complete. Please make the payment to download.</div>);
            } catch (error) {
                setMessage(<div className="message-container">Error translating transcript. You were not charged.</div>);
            }
        } else if (!isChecked && isNonEnglish) {
            setMessage(
                <div className="message-container">
                    <p>Transcript available. This video is in a non-English language.</p>
                    <p>You can get the transcript in the original language</p>
                    <p>or translated to English for an extra fee.</p>
                </div>
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (transcriptionStarted) return;
        setLoading(true);
        setIsNonEnglish(false);
        setTranslationError(false);
        setPaymentError(false);
        setTranscriptionStarted(true);

        try {
            const videoId = extractVideoId(url);
            const audioBuffer = await fetchAudioStream(videoId);
            const generatedTranscript = await processAudioBuffer(audioBuffer, translate);

            const language = detectLanguage(generatedTranscript);
            if (language !== 'en') {
                setIsNonEnglish(true);
                setMessage(
                    <div className="message-container">
                        <p>Transcript available. This video is in a non-English language.</p>
                        <p>You can get the transcript in the original language</p>
                        <p>or translated to English for an extra fee.</p>
                    </div>
                );
            } else {
                setMessage(
                <div className="message-container">
                    <p>Transcript available. Please make the payment to download.</p>
                </div>
                );
            }

            setTranscript(generatedTranscript);
            setIsPaymentReady(true);
        } catch (error) {
            setMessage(<div className="message-container">{error.message}</div>);
        } finally {
            setLoading(false);
            setShowGetTranscriptButton(false);
        }
    };

    const extractVideoId = (url) => {
        try {
            const urlObj = new URL(url);
            const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }
            return videoId;
        } catch (error) {
            throw new Error('Invalid URL format');
        }
    };

    const fetchAudioStream = async (videoId) => {
        try {
            const response = await axios.get(`https://your-vercel-backend.vercel.app/api/get-audio-stream?videoId=${videoId}`, { responseType: 'arraybuffer' });
            return response.data;
        } catch (error) {
            throw new Error('Error fetching audio stream');
        }
    };

    const processAudioBuffer = async (audioBuffer, translate) => {
        const formData = new FormData();
        formData.append('audio', new Blob([audioBuffer], { type: 'audio/wav' }));
        formData.append('translate', translate ? 'true' : 'false');

        console.log('Sending form data with translate flag:', translate);

        const response = await axios.post('/api', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.transcript;
    };

    const detectLanguage = (text) => {
        const langCode = franc(text);
        const lang = iso6393to1[langCode] || 'unknown';
        return lang;
    };

    const iso6393to1 = {
        'eng': 'en',
        'spa': 'es',
        'fra': 'fr',
        'hi' : 'hi',
        'ur' : 'ur'
    };

    const handlePaymentSuccess = async () => {
        console.log('Translate flag at payment success:', translate);
        if (isNonEnglish && translate) {
            try {
                const translatedTranscript = await translateTranscript(transcript);
                setTranscript(translatedTranscript);
                setMessage('Payment successful. Download your transcript below.');
                setIsPaymentReady(false);
                localStorage.setItem('transcript', translatedTranscript);
            } catch (error) {
                setMessage('Error translating transcript. You were not charged.');
            }
        } else {
            setMessage('Payment successful. Download your transcript below.');
            setIsPaymentReady(false);
            localStorage.setItem('transcript', transcript);
        }
    };

    const translateTranscript = async (text) => {
        try {
            const response = await axios.post('https://your-vercel-backend.vercel.app/api/translate', { text, translate: 'true' }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data.translatedText;
        } catch (error) {
            throw new Error('Error translating transcript');
        }
    };

    const handlePaymentError = () => {
        setMessage('An error occurred during payment. You were not charged.');
    };

    const handleGoBack = () => {
        setUrl('');
        setMessage('');
        setTranscript('');
        setIsPaymentReady(false);
        setLoading(false);
        setIsNonEnglish(false);
        setTranslate(false);
        setShowGetTranscriptButton(true);
    };

    return (
        <div>
                <form onSubmit={handleSubmit}>
                    <label>
                        Please enter the YouTube URL:
                        <input type="text" value={url} onChange={handleUrlChange} required />
                    </label>
                    {showGetTranscriptButton && (
                        <button type="submit" disabled={loading}>
                            {loading ? 'Processing... Please wait..' : 'Get Transcript'}
                        </button>
                    )}
                    {isNonEnglish && (
                        <label>
                            Translate to English:
                            <input type="checkbox" checked={translate} onChange={handleTranslateChange} />
                        </label>
                    )}
                </form>
                {message && <p>{message}</p>}
                {isPaymentReady && (
                    <PayPalScriptProvider options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID }}>
                        <PayPalButtons
                            style={{ layout: 'vertical' }}
                            createOrder={(data, actions) => {
                                const amount = isNonEnglish ? "6.00" : "4.00";
                                return actions.order.create({
                                    purchase_units: [{
                                        amount: {
                                            value: amount
                                        }
                                    }]
                                });
                            }}
                            onApprove={(data, actions) => {
                                return actions.order.capture().then(handlePaymentSuccess).catch(handlePaymentError);
                            }}
                            onError={handlePaymentError}
                        />
                    </PayPalScriptProvider>
                )}
                {(paymentError || translationError) && (
                    <div>
                        <p>{message}</p>
                        <button onClick={handleGoBack}>Go Back</button>
                    </div>
                )}
                {message === 'Payment successful. Download your transcript below.' && (
                    <div>
                        <a 
                            className="download-button"
                            href={`data:text/plain;charset=utf-8,${encodeURIComponent(transcript)}`}
                            download="transcript.txt"
                        >
                            Download Transcript
                        </a>
                        <button className="go-back-button" onClick={handleGoBack}>Go Back</button>
                    </div>
                )}
            </div>
    );
};

export default TranscriptForm;
