# 3D AI Classroom

![3D-school(1)-Cover](https://github.com/theringsofsaturn/3d-ai-school-threejs/assets/60050952/0349d7bf-7e18-4101-b018-4c15a1be4a3d)

A 3D, web-based classroom where an AI teacher guides learners through an immersive environment — blending 3D visuals, natural language, and voice interaction for a more humanized learning experience.

---

## Story

When we started this project, we wanted to explore what learning could feel like if it combined the spatial presence of a classroom with the interactivity of modern AI. The goal was to create a place where students can navigate a 3D scene, approach an AI-powered teacher avatar, ask questions by typing or speaking, and receive thoughtful, spoken responses backed by a chat history. This prototype demonstrates how Three.js visuals, animated models, and a locally-hosted Llama model can create an engaging educational demo without relying on a closed-cloud LLM API.

---

## Development stack

- Frontend
  - React — app structure and UI
  - Three.js / React Three Fiber — 3D rendering and scene management
  - Blender — scene and asset creation
  - Mixamo — character animations and rigging
- Backend / Model inference
  - Express.js — lightweight API / proxy server for handling requests from the browser
  - Llama (local inference) — model runs locally (via llama.cpp, llama-cpp-python, text-generation-webui, or similar)
- Integrations
  - Web Speech API (or similar) — microphone input / voice recognition
  - Web Speech Synthesis (or TTS service) — text-to-speech playback
- Tooling
  - Node.js / npm — dependency management and scripts
  - Python (optional) — if using python-based local model servers (e.g., text-generation-webui or llama-cpp-python)

Each piece plays a role: Blender/Mixamo create polished 3D assets; React + R3F render and control them in the browser; an Express proxy communicates with a local Llama inference server to generate responses and avoid exposing model files or model access in the browser.

---

## Features

- Immersive 3D classroom environment
- Llama-powered teacher avatar with chat capabilities (local inference)
- Animated 3D models (Mixamo)
- Voice recognition (speech-to-text) and text-to-speech responses
- Chat history to review past interactions
- Express-based server/proxy to communicate with the local model server

---

## Architecture overview

- Frontend (React) → sends chat requests to the Express proxy
- Express proxy → forwards requests to the local Llama inference server (HTTP) or calls a local Python module
- Llama inference server → returns text completions which the proxy sends back to the frontend
- Frontend → plays TTS audio using browser APIs or an integrated TTS service

This approach keeps heavy model inference off the client and allows you to run models locally (on CPU/GPU) or on a dedicated host.

---

## Installation

Prerequisites
- Node.js (recommended: 16.x or higher)
- npm (bundled with Node.js)
- If running model server locally:
  - Python 3.8+ (optional, for some model servers)
  - Sufficient disk space for model weights (several GBs depending on model)
  - Build tools if using llama.cpp (C/C++ compiler)

1. Clone the repository
```bash
git clone https://github.com/basiceyed/final-project.git
cd final-project
```

2. Install frontend/backend dependencies
```bash
npm install
```

3. Choose a Llama inference option

Option A — Run a local model server (recommended for local development)
- Popular projects:
  - text-generation-webui (https://github.com/oobabooga/text-generation-webui) — full-featured web UI + server for many local models
  - llama.cpp + text-generation-servers or the llama.cpp examples that include a simple server
  - llama-cpp-python + a small FastAPI wrapper (https://github.com/abetlen/llama-cpp-python)

General steps (text-generation-webui example)
```bash
# clone the web UI
git clone https://github.com/oobabooga/text-generation-webui.git
cd text-generation-webui

# put your model files into the models/ directory or point to a model path
# then start the web UI / server
python launch.py --model <your-model-identifier-or-path>
# The server typically runs at http://127.0.0.1:7860 or a configurable port
```

General steps (llama.cpp/llama-cpp-python example)
- Build or install llama.cpp or llama-cpp-python and convert your model to GGML format if required.
- Run the server or Python process that exposes an HTTP API endpoint which accepts prompts and returns completions.

Option B — Use a hosted inference endpoint (self-hosted cloud or huggingface)
- Deploy your Llama model to a server (VM, container) or use Hugging Face Inference API (requires HF token).
- Expose an HTTP endpoint that accepts chat requests and returns model responses.

4. Configure the Express proxy (project-specific)

Create a `.env` file in the project root with variables the client/proxy expects. Example:
```env
# Example variables — update according to your proxy implementation
MODEL_SERVER_URL=http://127.0.0.1:7860/api/generate
# Or if your Express proxy calls a local Python module:
# MODEL_PATH=./models/ggml-model-q4_0.bin
# HF_TOKEN=hf_xxx        # only if you use Hugging Face inference
PORT=3001
```

Notes:
- The client sends requests to the Express proxy (so the browser never talks directly to the model server unless explicitly allowed).
- Ensure ports and URLs match the code in your proxy and frontend (search for where the client fetches the API).

5. Start the model server (follow chosen option) and the proxy

- Start the local model server (example)
  - text-generation-webui: `python launch.py --model <model>`
  - llama.cpp server: follow the project's server instructions

- Start the Express proxy (from project root)
```bash
node proxy.js
# or if the project contains scripts:
# npm run proxy
```

- Start the frontend
```bash
npm start
# Usually runs at http://localhost:3000
```

Open http://localhost:3000 and interact with the AI teacher. Grant the browser microphone permission if you want voice input.

---

## Usage

- Move around the classroom with mouse and keyboard.
- Click or approach the teacher avatar to open the chat.
- Type or speak questions; the Llama-powered teacher will reply (text and, optionally, TTS).
- Use the chat history panel to review previous conversations.

---

## Environment & Security notes

- Do NOT commit model weights, API tokens, or private credentials to the repo.
- If you use a hosted inference service (Hugging Face or similar), store tokens in environment variables and server-side configuration — never expose them to client-side code.
- When running locally, restrict network access to the model server if necessary.

---

## Development tips

- 3D assets: edit Blender files and re-export glTF/GLB for best Three.js compatibility.
- Animation: Mixamo exports are typically retargeted to your avatar; ensure consistent rigging.
- Debugging model calls: log requests/responses in the Express proxy to inspect payloads and returned tokens.
- For performance: smaller quantized GGML models run faster on CPU; GPUs can be leveraged if using a PyTorch/TensorRT stack.

---

## Deployment

- Build the frontend:
```bash
npm run build
```
- Serve the `build` directory from a static host or via your production backend.
- Deploy the model server on a machine with sufficient CPU/GPU and disk space (or use a cloud instance).
- Set environment variables for production (MODEL_SERVER_URL, any tokens, etc.) on the host, not in the code.

---

## Contributing

Contributions are welcome! Suggested workflow:
- Fork the repo
- Create a feature branch: `git checkout -b feat/some-feature`
- Commit changes and open a pull request with a description of your changes

Please open issues for feature requests, bugs, or discussion before large changes.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
