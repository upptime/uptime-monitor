import NotifMeSdk from "notifme-sdk";
import { getSecret } from "../../secrets";

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
