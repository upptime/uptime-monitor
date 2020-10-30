import { UpptimeConfig } from "./interfaces";
import axios from "axios";

export const sendNotification = async (config: UpptimeConfig, text: string) => {
  console.log("[debug] Sending notification", text);
  console.log(`[debug] Notification config has ${(config.notifications || []).length} keys`);
  for await (const notification of config.notifications || []) {
    if (notification.type === "slack") {
      console.log("[debug] Sending Slack notification to channel", notification.channel);
      const token = process.env.SLACK_APP_ACCESS_TOKEN;
      if (token)
        await axios.post(
          "https://slack.com/api/chat.postMessage",
          { channel: notification.channel, text },
          { headers: { Authorization: `Bearer ${process.env.SLACK_BOT_ACCESS_TOKEN}` } }
        );
      console.log("[debug] Slack token found?", !!token);
    } else if (notification.type === "discord") {
      console.log("[debug] Sendind Discord notification");
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) await axios.post(webhookUrl, { content: text });
    }
  }
  console.log("[debug] Notifications are sent");
};
