import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './EmotionDetector.css';

function EmotionDetector({ setDetectedMood }) {
  const webcamRef = useRef(null);
  const [emotion, setEmotion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const captureAndDetect = async () => {
    setIsLoading(true);
    const imageSrc = webcamRef.current.getScreenshot();
  
    if (!imageSrc) {
      alert("Webcam image not captured.");
      setIsLoading(false);
      return;
    }
  
    console.log("Captured Image:", imageSrc);
  
    try {
      const blob = await fetch(imageSrc).then(res => res.blob());
      const formData = new FormData();
      formData.append('image', blob, 'emotion.jpg');
  
      const response = await axios.post('http://localhost:5000/detect_emotion', formData);
      console.log("Server Response:", response.data);
  
      setEmotion(response.data.emotion);
      setDetectedMood(response.data.mood);
    } catch (error) {
      console.error("Error sending image to server:", error);
      alert("Failed to detect emotion.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="emotion-detector">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="webcam-view"
      />
      <button 
  onClick={() => {
    console.log("Button clicked");
    captureAndDetect();
  }} 
  disabled={isLoading}
  className="detect-button"
>
  {isLoading ? 'Detecting...' : 'Detect Emotion'}
</button>

      {emotion && (
        <div className="result">
          <p>Detected Emotion: <strong>{emotion}</strong></p>
        </div>
      )}
    </div>
  );
}

export default EmotionDetector;