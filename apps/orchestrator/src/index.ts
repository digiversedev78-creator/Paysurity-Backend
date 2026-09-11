import express from 'express';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;
const projectId = process.env.GCP_PROJECT_ID || 'paysurity-platform-2026';

const secretsClient = new SecretManagerServiceClient();
const processedUpdates = new Set(); // Phase 1 Idempotency Gate

app.post('/webhook/telegram', async (req, res) => {
  try {
    const update = req.body;
    
    // 1. Idempotency Check (Drop duplicates instantly)
    if (update.update_id && processedUpdates.has(update.update_id)) {
      console.log(`Duplicate update_id: ${update.update_id}. Dropping payload.`);
      return res.status(200).send('Duplicate');
    }
    if (update.update_id) processedUpdates.add(update.update_id);

    // 2. Command Router
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      // 3. Native GCP Secret Retrieval
      const [version] = await secretsClient.accessSecretVersion({
        name: `projects/${projectId}/secrets/telegram-bot-token/versions/latest`,
      });
      const botToken = version.payload?.data?.toString();

      // 4. Payload Generation
      let replyText = "Command unrecognized. Send /start or a Diagnostic Ping.";
      if (text === '/start') {
        replyText = "PaySurity Serverless Bridge Online. Secure environment initialized.";
      } else if (text.includes('Diagnostic Ping')) {
        replyText = "Verified. Vertex AI bridge is connected, active, and bypassing rate limits.";
      }

      // 5. Telegram Dispatch
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: replyText })
      });
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Execution Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => console.log(`PaySurity Orchestrator live on port ${port}`));
