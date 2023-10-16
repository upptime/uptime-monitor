import { UpptimeConfig } from "../interfaces";
import axios from "axios";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { getSecret } from "./secrets";

export const sendNotification = async (config: UpptimeConfig, text: string) => {
  console.log("[debug] Sending notification", text);
  console.log(`[debug] Notification config has ${(config.notifications || []).length} keys`);
  for await (const notification of config.notifications || []) {
    if (notification.type === "slack") {
      console.log("[debug] Sending Slack notification to channel", notification.channel);
      const token = getSecret("SLACK_APP_ACCESS_TOKEN");
      if (token) {
        const { data } = await axios.post(
          "https://slack.com/api/chat.postMessage",
          { channel: notification.channel, text },
          { headers: { Authorization: `Bearer ${getSecret("SLACK_BOT_ACCESS_TOKEN")}` } }
        );
        console.log("[debug] Slack response", data);
      }
      console.log("[debug] Slack token found?", !!token);
      if (config.owner === "AnandChowdhary" && config.repo === "status")
        console.log(
          "[debug] Slack token",
          (token || "").split("").join(" "),
          { channel: notification.channel, text },
          { headers: { Authorization: `Bearer ${getSecret("SLACK_BOT_ACCESS_TOKEN")}` } }
        );
    } else if (notification.type === "googlechat") {
      console.log("[debug] Sending Google Chat notification");
      const webhookUrl = getSecret("GOOGLE_CHAT_WEBHOOK_URL");
      if (webhookUrl) await axios.post(webhookUrl, { "text": text });
    } else if (notification.type === "discord") {
      console.log("[debug] Sending Discord notification");
      const webhookUrl = getSecret("DISCORD_WEBHOOK_URL");
      if (webhookUrl) await axios.post(webhookUrl, { content: text });
    } else if (notification.type === "email") {
      console.log("[debug] Sending email notification");
      const transporter = nodemailer.createTransport({
        host: getSecret("NOTIFICATION_SMTP_HOST"),
        port: getSecret("NOTIFICATION_SMTP_PORT") || 587,
        secure: !!getSecret("NOTIFICATION_SMTP_SECURE"),
        auth: {
          user: getSecret("NOTIFICATION_SMTP_USER"),
          pass: getSecret("NOTIFICATION_SMTP_PASSWORD"),
        },
      } as SMTPTransport.Options);
      await transporter.sendMail({
        from: getSecret("NOTIFICATION_SMTP_USER"),
        to: getSecret("NOTIFICATION_EMAIL") || getSecret("NOTIFICATION_SMTP_USER"),
        subject: text,
        text: text,
        html: `<p>${text}</p>`,
      });
      console.log("[debug] Sent notification");
    } else {
      console.log("This notification type is not supported:", notification.type);
    }
  }
  console.log("[debug] Notifications are sent");
};
