import React, { useState, useEffect } from "react";
import { FaSpinner, FaComments, FaKeyboard, FaRegShareSquare, FaPlay, FaPause} from "react-icons/fa";
import AudioRecorder from "./AudioRecorder.jsx";
import WaveSurfer from "wavesurfer.js";
import axios from "axios";

const App = () => {
  const [conversation, setConversation] = useState({ conversation: [] });
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioTranscription, setAudioTranscription] = useState("");
  const [isTypingOn, setIsTypingOn] = useState(true);
  const [isHistoryOn, setIsHistoryOn] = useState(true);
  const [messageAudio, setMessageAudio] = useState(null);
  const [audioMessages, setAudioMessages] = useState({ userAudioMessage: null, aiAudioMessage: null });

  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
  useEffect(() => {
    const fetchConversation = async () => {
      const conversationId = localStorage.getItem("conversationId");
      if (conversationId) {
        const response = await fetch(
          `http://localhost:8000/service2/${conversationId}`
          );
        const data = await response.json();
        if (!data.error) {
          setConversation(data);
        }
      }
    };
    
    fetchConversation();
  }, []);
  
  useEffect(() => {
    if (audioTranscription !== "") {
      handleSubmit();
    }
  }, [audioTranscription]);

  useEffect(() => {
    if (audioMessages.userAudioMessage !== null) {
      drawAudio(audioMessages.userAudioMessage, true);
    }

    if (audioMessages.aiAudioMessage !== null) {
      drawAudio(audioMessages.aiAudioMessage);
    }
    
    setAudioMessages({userAudioMessage: null, aiAudioMessage: null});

  }, [
    audioMessages.aiAudioMessage
  ]);

  const generateConversationId = () =>
  "_" + Math.random().toString(36).slice(2, 11);
  
  const handleInputChange = (event) => {
    setUserMessage(event.target.value);
  };
  
  const handleTranscriptionChange = (newTranscription) => {
    setAudioTranscription(newTranscription);
  };

  const handleUserAudioMessageChange = (newUserAudioMessage) => {
    // setAudioMessages({...audioMessages, [userAudioMessage]: e.target.value})
    setAudioMessages(previousState => {
      return { ...previousState, userAudioMessage: newUserAudioMessage }
    });
  };

  const handleTypingChange = () => {
    isTypingOn ? setIsTypingOn(false) : setIsTypingOn(true);
  };

  const handleHistoryChange = () => {
    const conversationHistory = document.querySelector('#conversationHistory');
    isHistoryOn
    ? setIsHistoryOn(false) & conversationHistory.classList.add('hidden')
    : setIsHistoryOn(true) & conversationHistory.classList.remove('hidden');
  };

  const handleNewSession = () => {
    localStorage.removeItem("conversationId");
    setConversation({ conversation: [] });
  };  
  
  const handleSubmit = async () => {
    setIsLoading(true);
    let conversationId = localStorage.getItem("conversationId");
    if (!conversationId) {
      conversationId = generateConversationId();
      localStorage.setItem("conversationId", conversationId);
    }
    
    let newConversation;
    if (audioTranscription) {
      newConversation = [
        ...conversation.conversation,
        { role: "user", content: audioTranscription },
      ];
    } else {
      newConversation = [
        ...conversation.conversation,
        { role: "user", content: userMessage },
      ];
    }
    
    const response = await fetch(
      `http://localhost:8000/service2/${conversationId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: newConversation }),
      }
    );

    console.log(conversation.conversation);

    const data = await response.json();
    setConversation(data);
    
    generateAudio(data.conversation.slice(-1)[0]["content"])    
    .then((newAiAudioMessage) => {
      setAudioMessages(previousState => {
        return { ...previousState, aiAudioMessage: newAiAudioMessage }
      });
    });

    setUserMessage("");
    setAudioTranscription("");
    setIsLoading(false);    
  };
  
  // Function to convert text to speech
  async function generateAudio(
    inputText,
    model = "tts-1",
    voice = "shimmer",
    response_format = "opus"
    ) {      
      const url = "https://api.openai.com/v1/audio/speech";
      const headers = {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      };
      
      const requestBody = {
        "model": model,
        "voice": voice,
        "input": inputText,
        "response_format": response_format
      };
            
      try {
        const response = await axios.post(url, requestBody, {"headers": headers, "responseType": "arraybuffer"});      
        const data = await response.data;
        
        const audio = document.createElement('audio');        
        
        const blob = new Blob([data], { type : 'audio/ogg; codecs="opus"' });        
        const audioURL = window.URL.createObjectURL(blob);        
        audio.src = audioURL;

        return audio;
      } catch (error) {
        if (error.response) {
          console.error(
            `Error with HTTP request: ${error.response.status} - ${error.response.statusText}`
          );
        } else {
          console.error(`Error in generateAudio: ${error.message}`);
        }
      }    
  };

  // Function that draw audio messages
  function drawAudio(
    audio,
    user = false
    ) {
      const messagePath = `.${user ? "user-message:nth-last-child(2)" : "ai-message:last-child"} > :last-child > section` 
      const curMessageAudioContainer = document.querySelector(messagePath);
      if (user) document.querySelector(".user-message:nth-last-child(2) > :last-child").classList.remove("hidden");
      const messageAudioTime = document.querySelector(`${messagePath} > :last-child`);
      const duration = document.createElement("span");
      const current = document.createElement("span");
      const playPauseButton = document.querySelector(`${messagePath} > button`);
      const playSvg = document.querySelector(`${messagePath} > button > .play-svg`);
      const pauseSvg = document.querySelector(`${messagePath} > button > .pause-svg`);
      const waveform = WaveSurfer.create({
        container: `${messagePath} > .wave`,
        waveColor: '#6684b4',
        progressColor: '#003282',
        url: audio.src,
        barWidth: 1,
        height: 20,
        interact: true,
        cursorColor: "transparent",
      });
      const timeCalculator = function (value) {
        let second = Math.ceil(value % 60);
        let minute = Math.floor((value / 60) % 60);        
        if (second < 10) { second = "0" + second; }
        return minute + ":" + second;
      };

      messageAudioTime.append(current, duration);

      curMessageAudioContainer.onanimationend = () => {
        curMessageAudioContainer.classList.remove('animate-amfade');
      };
      
      waveform.load(audio);      
      
      waveform.on("ready", function (e) {
        current.textContent = "0:00";
        duration.textContent = "/" + timeCalculator(waveform.getDuration());
        playPauseButton.classList.remove('hidden');
        messageAudioTime.classList.remove('hidden');
        if (user) {
          pauseSvg.classList.add('hidden');
        } else {
          waveform.play();
          playSvg.classList.add('hidden');
        }
      });

      waveform.on("play", function (e) {
        playSvg.classList.add('hidden');
        pauseSvg.classList.remove('hidden');
      });

      waveform.on("pause", function (e) {
        pauseSvg.classList.add('hidden');
        playSvg.classList.remove('hidden');
      });

      waveform.on("finish", function (e) {
        waveform.seekTo(0);
        current.textContent = timeCalculator(waveform.getCurrentTime());
        pauseSvg.classList.add('hidden');
        playSvg.classList.remove('hidden');
      });

      waveform.on("audioprocess", function (e) {
        current.textContent = timeCalculator(waveform.getCurrentTime());
      });

      playPauseButton.onclick = function() {
        waveform.playPause();
      };
  };
      
  return (
    <div
      className="App flex flex-col items-center pt-6 min-h-screen bg-gray-900 text-sm"
      style={{
        // backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/background.jpg')`,
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1 className="text-3xl font-bold mb-4 text-white">Hi! im4talkin 🇬🇧</h1>
      {conversation.conversation.length > 0 ? (
        <div
          id="conversationHistory"
          className="flex flex-col p-4 bg-white rounded shadow w-full max-w-md space-y-4"
          style={{
            maxHeight: "60vh",
            overflow: "auto",
            flexDirection: "column-reverse",
            overflowAnchor: "auto !important"
          }}
        >
          <div
            className="flex flex-col"
          >
          {conversation.conversation
            .filter((message) => message.role !== "system")
            .map((message, index) => (
              <div
                key={index}
                id={`message-${index}`}
                className={`${
                  message.role === "user" 
                  ? "user-message bg-gray-100 rounded-l-lg rounded-br-lg pl-3 pr-3 pt-1.5 pb-1.5 ml-8 mr-4 mb-3 before:content-['👽'] before:-right-7 before:-top-4 before:text-xl before:absolute self-end"
                  : "ai-message bg-blue-100 rounded-r-lg rounded-bl-lg pl-3 pr-3 pt-1.5 pb-1.5 ml-4 mr-8 mb-3 before:content-['👩‍🚀'] before:-left-7 before:-top-4 before:text-xl before:absolute self-start"
                }`}
                style={{
                  transform: "translateZ(0)", /* fixes a bug in Safari iOS where the scroller doesn't update */
                }}
              >
                <span
                  className={`${
                    message.role === "user" 
                    ? "text-gray-900 leading-5" 
                    : "text-gray-700 leading-5"
                  }`}
                >
                  {message.content}
                </span>
                <div
                  className={`${
                    message.role === "user" 
                    ? "h-5 mt-2 hidden"
                    : "h-5 mt-2"
                  }`}
                >
                  <section
                    className="flex flex-row text-[#003282] animate-amfade min-w-[10rem]"
                  >
                    <button
                      className="hidden self-start flex-none mr-2"
                      type="button"
                    >
                      <FaPlay className="play-svg text-l"/>
                      <FaPause className="pause-svg text-l"/>
                    </button>
                    <div className="wave w-[calc(100%-6rem)]"></div>
                    <div className="hidden self-end flex-none ml-2"></div>
                  </section>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {conversation.conversation.length > 0 && isHistoryOn ? (
        <button
          className="mb-4 p-2 rounded-full bg-green-700 text-white absolute bottom-40 right-4"
          onClick={handleHistoryChange}
          type="button"
        >
          <FaComments className="text-3xl m-2"/>
        </button>
      ) : null}
      {conversation.conversation.length > 0 && !isHistoryOn ? (
        <button
          className="mb-4 p-2 rounded-full bg-gray-800 text-gray-400 absolute bottom-40 right-4"
          onClick={handleHistoryChange}
          type="button"
        >
          <FaComments className="text-3xl m-2"/>
        </button>
      ) : null}
      {isTypingOn ? (
        <div className="flex flex-row w-full max-w-md mt-4">
          <input
            type="text"
            value={userMessage}
            onChange={handleInputChange}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
            className="flex-grow mr-2 p-2 rounded border-gray-300"
            placeholder={isLoading ? "Processing..." : "Type your message here"}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading | !userMessage}
            className={
              isLoading | !userMessage
              ? "p-2 rounded text-white bg-[#335b9b] w-16"
              : "p-2 rounded text-white bg-[#003282] w-16"
            } 
          >
            Send
          </button>
        </div>
      ) : null}
      <AudioRecorder onNewTranscription={handleTranscriptionChange} onNewUserAudio={handleUserAudioMessageChange}/>
      {isLoading && (
        <div className="flex items-center space-x-4 text-l text-white">
          <FaSpinner className="animate-spin" />
          <span>Loading...</span>
        </div>
      )}
      <button
        onClick={handleNewSession}
        className="mt-4 p-2 rounded-full bg-gray-200 absolute top-0 left-4"
      >
        <div className="">
          <p className="">New</p>
          <FaRegShareSquare className="text-2xl ml-3.5 mr-2 mb-1.5 -mt-1" />
        </div>
      </button>
      {isTypingOn ? (
        <button
          className="mb-4 p-2 rounded-full bg-green-700 text-white absolute bottom-0 right-4"
          onClick={handleTypingChange}
          type="button"
        >
          <FaKeyboard className="text-3xl m-2"/>
        </button>
      ) : (
        <button
          className="mb-4 p-2 rounded-full bg-gray-800 text-gray-400 absolute bottom-0 right-4"
          onClick={handleTypingChange}
          type="button"
        >
          <FaKeyboard className="text-3xl m-2"/>
        </button>
      )}
    </div>
  );
};

export default App;
