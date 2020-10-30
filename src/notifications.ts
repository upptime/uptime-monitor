import { UpptimeConfig } from "./interfaces";
import axios from "axios";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

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
      console.log("[debug] Sending Discord notification");
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) await axios.post(webhookUrl, { content: text });
    } else if (notification.type === "email") {
      console.log("[debug] Sending email notification");
      const transporter = nodemailer.createTransport({
        host: process.env.NOTIFICATION_SMTP_HOST,
        port: process.env.NOTIFICATION_SMTP_PORT || 587,
        secure: !!process.env.NOTIFICATION_SMTP_SECURE,
        auth: {
          user: process.env.NOTIFICATION_SMTP_USER,
          pass: process.env.NOTIFICATION_SMTP_PASSWORD,
        },
      } as SMTPTransport.Options);
      await transporter.sendMail({
        from: process.env.NOTIFICATION_SMTP_USER,
        to: process.env.NOTIFICATION_EMAIL || process.env.NOTIFICATION_SMTP_USER,
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
