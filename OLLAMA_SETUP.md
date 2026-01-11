# Ollama Setup Instructions

## Step 1: Install Ollama

1. **Download Ollama for Windows:**
   - Visit: https://ollama.com/download
   - Download the Windows installer
   - Run the installer and follow the setup wizard

2. **Verify Installation:**
   - Open a new terminal/PowerShell window
   - Run: `ollama --version`
   - You should see the version number

## Step 2: Download a Model

After installing Ollama, you need to download a model. Here are some good options:

**Recommended models (run these in PowerShell):**

```powershell
# Small and fast (good for testing)
ollama pull llama3.2

# Or for better quality (larger, slower)
ollama pull llama3.1:8b

# Or even better quality (requires more RAM)
ollama pull llama3.1:70b
```

**Other popular models:**
- `ollama pull mistral` - Fast and efficient
- `ollama pull codellama` - Good for coding questions
- `ollama pull phi` - Very small, fast model

## Step 3: Start Ollama Service

Ollama should start automatically after installation. To verify it's running:

```powershell
# Check if Ollama is running
ollama list
```

If you see a list of models (or an empty list), Ollama is running!

## Step 4: Test the Setup

1. Make sure your proxy server is running (it should be already)
2. Open your browser and go to your app
3. Try chatting - it should now use Ollama!

## Troubleshooting

**If you get "Cannot connect to Ollama" error:**
- Make sure Ollama is running: `ollama list`
- Check if port 11434 is available
- Restart Ollama if needed

**To change the model:**
- Edit `proxy-server/.env` and add:
  ```
  OLLAMA_MODEL=llama3.2
  ```
- Or use a different model name you've downloaded

**To use a different Ollama URL:**
- Edit `proxy-server/.env` and add:
  ```
  OLLAMA_BASE_URL=http://localhost:11434
  ```

## Notes

- Ollama runs completely locally - no internet needed after downloading models
- First response might be slow as the model loads into memory
- Larger models need more RAM (8GB+ recommended for llama3.2)
- Models are downloaded to: `C:\Users\<YourUsername>\.ollama\`
