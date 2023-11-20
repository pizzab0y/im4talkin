import React, { useState, useEffect } from "react";
import { FaSpinner, FaPlus, FaComments, FaRegComments, FaKeyboard, FaRegKeyboard, FaRegShareSquare } from "react-icons/fa";
import AudioRecorder from "./AudioRecorder.jsx";
import axios from "axios";

const App = () => {
  const [conversation, setConversation] = useState({ conversation: [] });
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioTranscription, setAudioTranscription] = useState("");
  const [isTypingOn, setIsTypingOn] = useState(true);
  const [isHistoryOn, setIsHistoryOn] = useState(true);

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
      console.log("audioTranscription state has changed:", audioTranscription);
      handleSubmit();
    }
  }, [audioTranscription]);

  const generateConversationId = () =>
  "_" + Math.random().toString(36).slice(2, 11);
  
  const handleInputChange = (event) => {
    setUserMessage(event.target.value);
  };
  
  const handleTranscriptionChange = (newTranscription) => {
    setAudioTranscription(newTranscription);
  };  

  const handleTypingChange = () => {
    isTypingOn ? setIsTypingOn(false) : setIsTypingOn(true);
  };

  const handleHistoryChange = () => {
    isHistoryOn ? setIsHistoryOn(false) : setIsHistoryOn(true);
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

    const data = await response.json();
    setConversation(data);

    const formData = new FormData();
      formData.append("model", "tts-1");
      // formData.append("file", file);
      formData.append("voice", "alloy");
      formData.append("input", data);
      // formData.append("prompt", "All I speak is English.");
      // formData.append("lang", "en");
      
      axios
        .post("https://api.openai.com/v1/audio/speech", formData, {
        headers: {
          "Content-Type" : "multipart/form",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        })
        .then((res) => {
          const response = res.data;
          console.log(`We've got: ${response.text}`);
        })
        .catch((err) => {
          console.log(err);
        });

    setUserMessage("");
    setAudioTranscription("");
    setIsLoading(false);    
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
      {conversation.conversation.length > 0 && isHistoryOn ? (
        <div
          className="flex flex-col p-4 bg-white rounded shadow w-full max-w-md space-y-4"
          style={{
            maxHeight: "60vh",
            overflow: "auto",
            flexDirection: "column-reverse",
            overflowAnchor: "auto !important"
          }}
        >
          <div>
          {conversation.conversation
            .filter((message) => message.role !== "system")
            .map((message, index) => (
              <div
                key={index}
                className={`${
                  message.role === "user" ? "text-right bg-gray-200" : "text-left"
                }`}
                style={{
                  transform: "translateZ(0)", /* fixes a bug in Safari iOS where the scroller doesn't update */
                }}
              >
                <strong className="font-bold text-gray-900">
                  {`${message.role}: `}
                </strong>
                <span
                  className={`${
                    message.role === "user" ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {message.content}
                </span>
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
      <AudioRecorder onTranscriptionChange={handleTranscriptionChange} />
      {isLoading && (
        <div className="flex items-center space-x-4 text-l text-white">
          <FaSpinner className="animate-spin" />
          <span>Loading...</span>
        </div>
      )}
      <button
        onClick={handleNewSession}
        className="mt-4 p-2 w-[62px] h-[62px] rounded-full bg-gray-200 absolute top-0 left-4"
      >
        <p className="">New</p>
        <FaRegShareSquare className="text-2xl ml-3 mr-2 mb-1 -mt-1" />
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
