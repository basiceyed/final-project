import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Chat.css";

export const Chat = () => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const inputRef = useRef(null);

  // helper to send a message programmatically (used by voice capture)
  const sendMessage = async (message) => {
    if (!message || message.trim() === "") return;
    setLoading(true);
    const userMessage = message.trim();
    try {
      const response = await axios.post(
        "http://localhost:3001/api/chatgpt",
        { message: userMessage },
        { headers: { "Content-Type": "application/json" } }
      );
      const generatedText = response.data.response;
      setChatHistory((prev) => [...prev, { user: userMessage, bot: generatedText }]);
      setUserInput("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to connect to the server.";
      setChatHistory((prev) => [...prev, { user: userMessage, bot: `Error: ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut to open chat (press 'C' key)
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only trigger if not typing in input field and not already showing chat
      if (event.key === 'c' || event.key === 'C') {
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          setShowInput(true);
        }
      }
      // ESC to close
      if (event.key === 'Escape') {
        setShowInput(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (showInput) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [showInput]);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  // voice assistance
  const startListening = () => {
    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    // non-continuous mode so it ends after user stops speaking
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    // store last final transcript so onend can access it
    const lastFinal = { text: "" };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // show interim while speaking, but keep final saved
      setUserInput((interimTranscript || finalTranscript || "").trim());
      if (finalTranscript.trim() !== "") {
        lastFinal.text = finalTranscript.trim();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // if there was a final transcript, send it
      if (lastFinal.text && lastFinal.text.trim() !== "") {
        sendMessage(lastFinal.text.trim());
      }
    };

    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text) => {
    // Check if speech is enabled
    if (!speechEnabled) {
      return;
    }

    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis is not supported in this browser.");
      return;
    }

    // Don't speak error messages
    if (!text || text.startsWith("Error:")) {
      return;
    }

    const synthesis = window.speechSynthesis;
    
    // Cancel any ongoing speech
    synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      setIsSpeaking(false);
    };

    // Store reference to cancel if needed
    speechSynthesisRef.current = utterance;
    
    // Use speak with a small delay to ensure browser is ready
    try {
      synthesis.speak(utterance);
    } catch (error) {
      console.error("Error starting speech synthesis:", error);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (chatHistory.length > 0 && speechEnabled) {
      const lastResponse = chatHistory[chatHistory.length - 1].bot;
      // Only speak if it's a valid response (not an error)
      if (lastResponse && !lastResponse.startsWith("Error:")) {
        // Small delay to ensure the response is fully rendered
        const timer = setTimeout(() => {
          speak(lastResponse);
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [chatHistory, speechEnabled]);
  // end voice assistant

  // event handlers
  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    setLoading(true);
    const userMessage = userInput;
    setUserInput("");
    
    try {
      const response = await axios.post(
        "http://localhost:3001/api/chatgpt",
        {
          message: userMessage,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const generatedText = response.data.response;
      setChatHistory([...chatHistory, { user: userMessage, bot: generatedText }]);
      // Refocus input after sending message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          "Failed to connect to the server. Please make sure the proxy server is running on port 3001.";
      setChatHistory([...chatHistory, { 
        user: userMessage, 
        bot: `Error: ${errorMessage}` 
      }]);
      // Refocus input after error
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    setLoading(false);
  };

  const toggleInput = () => {
    setShowInput(!showInput);
    // Focus input when opening chat
    if (!showInput) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleClear = () => {
    setChatHistory([]);
    setUserInput("");
  };

  return (
    <div className="chat-component">
      <button className="chat-button" onClick={toggleInput}>
        {showInput ? "✕ Close Chat" : "💬 Ask a Question"}
      </button>
      {showInput && (
        <div className={`chat-box ${showInput ? "show" : ""}`}>
          <div id="container">
            <div className="container-inner">
              <div className="content">
                {chatHistory.length === 0 ? (
                  <p className="welcome-message">
                    Welcome to the chat! Ask a question to start a conversation
                    with Teacher Jay Mark Montecillo.
                  </p>
                ) : (
                  chatHistory.map((chat, index) => (
                    <div key={index}>
                      <p className="user-message">
                        <strong>You:</strong> {chat.user}
                      </p>
                      <p className="teacher-response">
                        <strong>ChatGPT:</strong> {chat.bot}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="input-container">
                <form onSubmit={handleSubmit}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleUserInput}
                    placeholder="Type your message and press Enter..."
                    required
                    autoFocus
                  />
                  {SpeechRecognition && (
                    <button
                      type="button"
                      onMouseDown={startListening}
                      onMouseUp={stopListening}
                      onTouchStart={startListening}
                      onTouchEnd={stopListening}
                    >
                      {isListening ? "Listening..." : "Hold to Speak"}
                    </button>
                  )}
                  <button type="submit" disabled={loading}>
                    <i className="send-icon">{loading ? "Sending..." : "➤"}</i>
                    <span>Send</span>
                  </button>
                </form>
              </div>
              {chatHistory.length > 0 && (
                <div className="buttons">
                  <button
                    type="button"
                    className="confirm"
                    onClick={toggleInput}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="cancel"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: "10px 15px",
                      marginLeft: "10px",
                      backgroundColor: speechEnabled ? "#4CAF50" : "#ccc",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                    onClick={() => {
                      setSpeechEnabled(!speechEnabled);
                      if (!speechEnabled && chatHistory.length > 0) {
                        const lastResponse = chatHistory[chatHistory.length - 1].bot;
                        if (lastResponse && !lastResponse.startsWith("Error:")) {
                          speak(lastResponse);
                        }
                      } else if (speechEnabled) {
                        window.speechSynthesis?.cancel();
                      }
                    }}
                  >
                    {speechEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
