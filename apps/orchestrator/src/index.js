const express = require('express');
const { VertexAI } = require('@google-cloud/vertexai');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USER_ID = process.env.ALLOWED_USER_ID;
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const LOCATION = 'us-central1';

const firestore = new Firestore({ projectId: PROJECT_ID });
const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });

const SYSTEM_INSTRUCTION = `You are the PaySurity Principal Orchestrator. 
MANDATE 1: You coordinate architecture and trigger GitHub Actions pipelines. 
MANDATE 2 (DEPENDENCY LOCK): Before requesting any code deletion, you must demand a blast-radius audit.
MANDATE 3 (FINTECH RULES): All money is stored as integers (cents). Ledger is append-only. 
You cannot run local code. Provide concise, executive updates.`;

const model = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-1.5-pro',
  systemInstruction: SYSTEM_INSTRUCTION
});

app.post(`/webhook`, async (req, res) => {
  res.sendStatus(200); // Instantly reply 200 to prevent Telegram from retrying the request
  
  const message = req.body.message;
  if (!message || !message.text || !message.from) return;

  // STRICT SECURITY PERIMETER: Drop unauthorized users instantly
  if (message.from.id.toString() !== ALLOWED_USER_ID) {
    console.warn(`SECURITY ALERT: Blocked unauthorized message from ID: ${message.from.id}`);
    return;
  }

  try {
     const chatId = message.chat.id.toString();
     const threadRef = firestore.collection('chats').doc(chatId);
     const doc = await threadRef.get();
     
     let history = doc.exists ? doc.data().history : [];
     history.push({ role: 'user', parts: [{ text: message.text }] });

     // Keep only the last 10 turns to save tokens and keep context relevant
     if (history.length > 20) history = history.slice(history.length - 20);

     // Ask Vertex AI
     const request = { contents: history };
     const streamingResp = await model.generateContentStream(request);
     const response = await streamingResp.response;
     const aiReply = response.candidates[0].content.parts[0].text;

     // Save AI response to memory
     history.push({ role: 'model', parts: [{ text: aiReply }] });
     await threadRef.set({ history });

     // Send back to Telegram
     await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ chat_id: chatId, text: aiReply })
     });

  } catch (error) {
     console.error("Vertex AI Orchestration Error:", error);
     await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ chat_id: message.chat.id, text: "System Error: Orchestration pipeline failed." })
     });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Vertex Bridge running securely on port ${port}`));
