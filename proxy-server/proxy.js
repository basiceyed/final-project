const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load .env file from the proxy-server directory
dotenv.config({ path: path.join(__dirname, ".env") });

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:1b"; // Default model (using your installed model)

console.log(`✓ Using Ollama at: ${OLLAMA_BASE_URL}`);
console.log(`✓ Model: ${OLLAMA_MODEL}`);

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/chatgpt", async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    // Validate request body
    if (!req.body || !req.body.message) {
      return res.status(400).json({ 
        error: "Message is required in request body." 
      });
    }

    // Use Ollama API
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt: `You are a helpful assistant and teacher. Answer the following question: ${req.body.message}`,
        stream: false,
      },
      {
        timeout: 60000, // 60 second timeout
      }
    );

    const responseText = response.data.response;
    res.json({ response: responseText });
  } catch (error) {
    console.error("Error Details:", error);
    
    let errorMessage = "An error occurred";
    let statusCode = 500;

    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      errorMessage = `Cannot connect to Ollama at ${OLLAMA_BASE_URL}. Please make sure Ollama is installed and running. Visit https://ollama.com to download.`;
      statusCode = 503;
    } else if (error.response) {
      // Ollama API error
      errorMessage = error.response.data?.error || error.message || "Ollama API error";
      statusCode = error.response.status || 500;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
