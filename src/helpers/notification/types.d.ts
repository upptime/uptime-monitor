import { Channel, EmailProvider, SlackProvider, SmsProvider } from "notifme-sdk";

export type NotificationChannels = {
  email?: Channel<EmailProvider>;
  sms?: Channel<SmsProvider>;
  slack?: Channel<SlackProvider>;
};
