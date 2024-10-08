import NotifMeSdk from "notifme-sdk";
import { getSecret } from "../../secrets";
import { NotificationChannels } from "../types";

/**
 * Check if a mail should be sent
 *
 * @returns boolean
 */
export function checkMaybeSendMail() {
  if (
    getSecret("NOTIFICATION_EMAIL_SENDGRID") ||
    getSecret("NOTIFICATION_EMAIL_SES") ||
    getSecret("NOTIFICATION_EMAIL_SPARKPOST") ||
    getSecret("NOTIFICATION_EMAIL_MAILGUN") ||
    getSecret("NOTIFICATION_EMAIL_SMTP")
  ) {
    return true;
  }
  return false;
}

/**
 * Setup the email channel
 *
 * @params channels NotificationChannels
 * @returns void
 */
export function setupNotifierEmailChannel(channels: NotificationChannels) {
  channels.email = {
    providers: [],
    multiProviderStrategy:
      (getSecret("NOTIFICATION_EMAIL_STRATEGY") as "fallback" | "roundrobin" | "no-fallback") ||
      "roundrobin",
  };

  if (getSecret("NOTIFICATION_EMAIL_SENDGRID")) {
    channels.email.providers.push({
      type: "sendgrid",
      apiKey: getSecret("NOTIFICATION_EMAIL_SENDGRID_API_KEY") as string,
    });
  }
  if (getSecret("NOTIFICATION_EMAIL_SES")) {
    channels.email.providers.push({
      type: "ses",
      region: getSecret("NOTIFICATION_EMAIL_SES_REGION") as string,
      accessKeyId: getSecret("NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID") as string,
      secretAccessKey: getSecret("NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY") as string,
      sessionToken: getSecret("NOTIFICATION_EMAIL_SES_SESSION_TOKEN") as string,
    });
  }
  if (getSecret("NOTIFICATION_EMAIL_SPARKPOST")) {
    channels.email.providers.push({
      type: "sparkpost",
      apiKey: getSecret("NOTIFICATION_EMAIL_SPARKPOST_API_KEY") as string,
    });
  }
  if (getSecret("NOTIFICATION_EMAIL_MAILGUN")) {
    channels.email.providers.push({
      type: "mailgun",
      apiKey: getSecret("NOTIFICATION_EMAIL_MAILGUN_API_KEY") as string,
      domainName: getSecret("NOTIFICATION_EMAIL_MAILGUN_DOMAIN_NAME") as string,
    });
  }
  if (getSecret("NOTIFICATION_EMAIL_SMTP")) {
    channels.email.providers.push({
      type: "smtp",
      port: (getSecret("NOTIFICATION_EMAIL_SMTP_PORT")
        ? parseInt(getSecret("NOTIFICATION_EMAIL_SMTP_PORT") || "", 10)
        : 587) as 587 | 25 | 465,
      host: getSecret("NOTIFICATION_EMAIL_SMTP_HOST") as string,
      auth: {
        user: getSecret("NOTIFICATION_EMAIL_SMTP_USERNAME") as string,
        pass: getSecret("NOTIFICATION_EMAIL_SMTP_PASSWORD") as string,
      },
    });
  }
}

/**
 * Send Email via NotifMeSdk
 *
 * @param notifier
 * @param message
 * @returns Promise<void>
 */
export async function sendEmail(notifier: NotifMeSdk, message: string) {
  try {
    await notifier.send({
      email: {
        from: (getSecret("NOTIFICATION_EMAIL_FROM") || getSecret("NOTIFICATION_EMAIL")) as string,
        to: (getSecret("NOTIFICATION_EMAIL_TO") || getSecret("NOTIFICATION_EMAIL")) as string,
        subject: message,
        html: message,
      },
    });
    console.log("Success email");
  } catch (error) {
    console.log("Got an error", error);
  }
  console.log("Finished sending email");
}
