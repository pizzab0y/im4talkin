import { useState, useRef } from "react";
import { FaSpinner, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import axios from 'axios';

const AudioRecorder = ({ onNewTranscription, onNewUserAudio }) => {
  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [transcription, setTranscription] = useState("");

  // set up necessary envrionmental variables
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const model = "whisper-1";

  const red_color = '#cc1227';
  const blue_color = '#003282';
  const gray_color = '#9ca3af';
    
  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
        
        window.canvas = document.querySelector('.visualizer');
        canvas.style.display = "";
        window.canvasCtx = canvas.getContext("2d");
        window.WIDTH = canvas.width;
        window.HEIGHT = canvas.height;
        canvasCtx.fillStyle = '#ffffff';
      
        draw_line();
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const revokeMicrophonePermission = () => {
    try {
      const audioTracks = Array.from(stream.getAudioTracks());
      audioTracks.forEach(track => track.stop());
    } catch (error) {
      console.error('Error stopping microphone permission:', error.message);
    }

    if (typeof draw_wave_anim !== 'undefined') {cancelAnimationFrame(draw_wave_anim);}
    if (typeof draw_line_anim !== 'undefined') {cancelAnimationFrame(draw_line_anim);}

    canvas.style.display = "none";
    permission ? setPermission(false) : setPermission(true);
  };

  const startRecording = async () => {
    setIsRecording(true);
    const media = new MediaRecorder(stream);

    let audioCtx;

    if(!audioCtx) {
      audioCtx = new AudioContext();
    }

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    source.connect(analyser);

    draw_wave();

    function draw_wave() {
      if (typeof draw_line_anim !== 'undefined') {
        cancelAnimationFrame(draw_line_anim);
      }
      window.draw_wave_anim = requestAnimationFrame(draw_wave);
  
      analyser.getByteTimeDomainData(dataArray);
  
      let sliceWidth = WIDTH * 1 / bufferLength;
      let x = 0;
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  
      canvasCtx.strokeStyle = '#000000';
      canvasCtx.beginPath();
  
      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let y = v * HEIGHT / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }
  
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    }  
  
    //set the MediaRecorder instance to the mediaRecorder ref
    mediaRecorder.current = media;
    mediaRecorder.current.start();
    let localAudioChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      console.log(event);
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorder.current.stop();
    draw_line();
    mediaRecorder.current.onstop = () => {
      if (navigator.userAgent.indexOf("Safari") >= 0 &&
      navigator.userAgent.indexOf("Chrome") < 0) {
        console.log("Safari browser detected");
        var blob = new Blob(audioChunks, { type : 'audio/m4a; codecs="aac"' });
        var fileName = 'to_transcript.m4a';
        var file = new File([blob], fileName);
      }
      else {
        console.log("Whooh... It's not Safari browser");
        var blob = new Blob(audioChunks, { type : 'audio/ogg; codecs="opus"' });
        var fileName = 'to_transcript.ogg';
        var file = new File([blob], fileName);
      }

      const audioURL = window.URL.createObjectURL(blob);        
      const audio = document.createElement('audio');   
      audio.src = audioURL;
      onNewUserAudio(audio);

      const formData = new FormData();
      formData.append("model", model);
      formData.append("file", file);
      formData.append("prompt", "All I speak is English.");
      formData.append("lang", "en");
      
      axios
        .post("https://api.openai.com/v1/audio/transcriptions", formData, {
        headers: {
          "Content-Type" : "multipart/form",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        })
        .then((res) => {
          const response = res.data;
          console.log(`We've got: ${response.text}`);
          setTranscription(response.text);
          onNewTranscription(response.text);
        })
        .catch((err) => {
          console.log(err);
        });
      setAudioChunks([]);
    };
  };  

  function draw_line() {
    if (typeof draw_wave_anim !== 'undefined') {cancelAnimationFrame(draw_wave_anim);}
    window.draw_line_anim = requestAnimationFrame(draw_line);
    
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);        
    let x = 0;          
    let y = HEIGHT / 2;

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = gray_color;
    canvasCtx.beginPath();  
    canvasCtx.moveTo(x, y);
    canvasCtx.lineTo(WIDTH, y);
    canvasCtx.stroke();
  };

  return (
    <div className="flex flex-row w-full max-w-md mt-4">
      <canvas className="visualizer flex-grow mr-2 rounded border-gray-300 h-16"></canvas>
      {permission ? (
        <button
          className="mt-4 p-2 rounded-full bg-green-700 text-white absolute bottom-24 right-4"
          onClick={revokeMicrophonePermission}
          type="button"
        >
          <FaMicrophone className="text-3xl m-2"/>
        </button>
      ) : (
        <button
          className="mt-4 p-2 rounded-full bg-gray-800 text-gray-400 absolute bottom-24 right-4 animate-[pulse_4s_cubic-bezier(0.4,_0,_0.6,_1)_infinite]"
          onClick={getMicrophonePermission}
          type="button"
        >
          <FaMicrophone className="text-3xl m-2"/>
        </button>    
      )}

      {permission && !isRecording ? (
        <button
          className="record p-2 w-16 rounded text-white bg-[#003282]"
          onClick={startRecording}
          type="button"
        >
          Say
        </button>
      ) : null}
      {permission && isRecording ? (
        <button
          className="stop p-2 rounded text-white bg-[#cc1227] w-16"
          onClick={stopRecording}
          type="button"
        >
          Stop saying 
        </button>          
      ) : null}
    </div>
  );
};

export default AudioRecorder;
