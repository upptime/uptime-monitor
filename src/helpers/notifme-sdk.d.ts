/**
 * @source https://gist.github.com/epiphone/34c04970680b6f4472cd7bb6153443c1
 */
declare module "notifme-sdk" {
  export type ChannelType = "email" | "sms" | "push" | "webpush" | "slack";
  export type ProviderStrategyType = "fallback" | "roundrobin" | "no-fallback";

  export default class NotifMeSdk {
    constructor(options: Options);

    send(notification: Notification): Promise<NotificationStatus>;
  }

  export type Options = {
    channels: {
      email?: Channel<EmailProvider>;
      sms?: Channel<SmsProvider>;
      push?: any; // TODO
      webpush?: any; // TODO
      slack?: Channel<SlackProvider>;
    };
    useNotificationCatcher?: boolean;
  };

  export type Notification = {
    metadata?: {
      id?: string;
      userId?: string;
    };
    email?: EmailRequest;
    push?: PushRequest;
    sms?: SmsRequest;
    webpush?: WebpushRequest;
    slack?: SlackRequest;
  };

  export type NotificationStatus = {
    status: "success" | "error";
    channels?: {
      [channel in ChannelType]: {
        id: string;
        providerId?: string;
      };
    };
    errors?: { [channel in ChannelType]: Error };
    info?: Object;
  };

  export type Channel<T> = {
    multiProviderStrategy?: MultiProviderStrategy | ProviderStrategyType;
    providers: T[];
  };

  export type MultiProviderStrategy = (providers: Provider[]) => any;

  //region PROVIDERS

  export type EmailProvider =
    | {
        type: "logger";
      }
    | {
        type: "custom";
        id: string;
        send: (request: EmailRequest) => Promise<string>;
      }
    | {
        // Doc: https://nodemailer.com/transports/sendmail/
        type: "sendmail";
        sendmail: true;
        path: string; // Defaults to 'sendmail'
        newline: "windows" | "unix"; // Defaults to 'unix'
        args?: string[];
        attachDataUrls?: boolean;
        disableFileAccess?: boolean;
        disableUrlAccess?: boolean;
      }
    | {
        // General options (Doc: https://nodemailer.com/smtp/)
        type: "smtp";
        port?: 25 | 465 | 587; // Defaults to 587
        host?: string; // Defaults to 'localhost'
        auth:
          | {
              type?: "login";
              user: string;
              pass: string;
            }
          | {
              type: "oauth2"; // Doc: https://nodemailer.com/smtp/oauth2/#oauth-3lo
              user: string;
              clientId?: string;
              clientSecret?: string;
              refreshToken?: string;
              accessToken?: string;
              expires?: string;
              accessUrl?: string;
            }
          | {
              type: "oauth2"; // Doc: https://nodemailer.com/smtp/oauth2/#oauth-2lo
              user: string;
              serviceClient: string;
              privateKey?: string;
            };
        authMethod?: string; // Defaults to 'PLAIN'
        // TLS options (Doc: https://nodemailer.com/smtp/#tls-options)
        secure?: boolean;
        tls?: Object; // Doc: https://nodejs.org/api/tls.html#tls_class_tls_tlssocket
        ignoreTLS?: boolean;
        requireTLS?: boolean;
        // Connection options (Doc: https://nodemailer.com/smtp/#connection-options)
        name?: string;
        localAddress?: string;
        connectionTimeout?: number;
        greetingTimeout?: number;
        socketTimeout?: number;
        // Debug options (Doc: https://nodemailer.com/smtp/#debug-options)
        logger?: boolean;
        debug?: boolean;
        // Security options (Doc: https://nodemailer.com/smtp/#security-options)
        disableFileAccess?: boolean;
        disableUrlAccess?: boolean;
        // Pooling options (Doc: https://nodemailer.com/smtp/pooled/)
        pool?: boolean;
        maxConnections?: number;
        maxMessages?: number;
        rateDelta?: number;
        rateLimit?: number;
        // Proxy options (Doc: https://nodemailer.com/smtp/proxies/)
        proxy?: string;
      }
    | {
        type: "mailgun";
        apiKey: string;
        domainName: string;
      }
    | {
        type: "sendgrid";
        apiKey: string;
      }
    | {
        type: "ses";
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken?: string;
      }
    | {
        type: "sparkpost";
        apiKey: string;
      };

  export type SmsProvider =
    | {
        type: "logger";
      }
    | {
        type: "custom";
        id: string;
        send: (request: SmsRequest) => Promise<string>;
      }
    | {
        type: "46elks";
        apiUsername: string;
        apiPassword: string;
      }
    | {
        type: "callr";
        login: string;
        password: string;
      }
    | {
        type: "clickatell";
        apiKey: string; // One-way integration API key
      }
    | {
        type: "infobip";
        username: string;
        password: string;
      }
    | {
        type: "nexmo";
        apiKey: string;
        apiSecret: string;
      }
    | {
        type: "ovh";
        appKey: string;
        appSecret: string;
        consumerKey: string;
        account: string;
        host: string; // https://github.com/ovh/node-ovh/blob/master/lib/endpoints.js
      }
    | {
        type: "plivo";
        authId: string;
        authToken: string;
      }
    | {
        type: "twilio";
        accountSid: string;
        authToken: string;
      };

  export type PushProvider =
    | {
        type: "logger";
      }
    | {
        type: "custom";
        id: string;
        send: (request: PushRequest) => Promise<string>;
      }
    | {
        // Doc: https://github.com/node-apn/node-apn/blob/master/doc/provider.markdown
        type: "apn"; // Apple Push Notification
        token?: {
          key: string;
          keyId: string;
          teamId: string;
        };
        cert?: string;
        key?: string;
        ca?: string[];
        pfx?: string;
        passphrase?: string;
        production?: boolean;
        rejectUnauthorized?: boolean;
        connectionRetryLimit?: number;
      }
    | {
        // Doc: https://github.com/ToothlessGear/node-gcm
        type: "fcm"; // Firebase Cloud Messaging (previously called GCM, Google Cloud Messaging)
        id: string;
        phonegap?: boolean;
      }
    | {
        // Doc: https://github.com/tjanczuk/wns
        type: "wns"; // Windows Push Notification
        clientId: string;
        clientSecret: string;
        notificationMethod: string; // sendTileSquareBlock, sendTileSquareImage...
      }
    | {
        // Doc: https://github.com/umano/node-adm
        type: "adm"; // Amazon Device Messaging
        clientId: string;
        clientSecret: string;
      };

  // TODO?: onesignal, urbanairship, goroost, sendpulse, wonderpush, appboy...
  export type WebpushProvider =
    | {
        type: "logger";
      }
    | {
        type: "custom";
        id: string;
        send: (request: WebpushRequest) => Promise<string>;
      }
    | {
        type: "gcm";
        gcmAPIKey?: string;
        vapidDetails?: {
          subject: string;
          publicKey: string;
          privateKey: string;
        };
        ttl?: number;
        headers?: { [key: string]: string | number | boolean };
      };

  export type SlackProvider =
    | {
        type: "logger";
      }
    | {
        type: "custom";
        id: string;
        send: (request: SlackRequest) => Promise<string>;
      }
    | {
        type: "webhook";
        webhookUrl: string;
      };

  export type Provider =
    | EmailProvider
    | SmsProvider
    | PushProvider
    | WebpushProvider
    | SlackProvider;

  //endregion PROVIDERS

  //region REQUEST TYPES:

  type RequestMetadata = {
    id?: string;
    userId?: string;
  };

  export type EmailRequest = RequestMetadata & {
    from: string;
    to: string;
    subject: string;
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
    text?: string;
    html?: string;
    attachments?: {
      contentType: string; // text/plain...
      filename: string;
      content: string | Buffer;
      // path?: string,
      // href?: string,
      // contentDisposition?: string,
      // contentTransferEncoding?: string,
      // cid?: string,
      // raw?: string,
      // encoding?: string,
      // headers?: {[string]: string | number | boolean}
    }[];
    headers?: { [key: string]: string | number | boolean };
  };

  export type PushRequest = RequestMetadata & {
    registrationToken: string;
    title: string;
    body: string;
    custom?: Object;
    priority?: "high" | "normal"; // gcm, apn. Will be translated to 10 and 5 for apn. Defaults to 'high'
    collapseKey?: string; // gcm for android, used as collapseId in apn
    contentAvailable?: boolean; // gcm for android
    delayWhileIdle?: boolean; // gcm for android
    restrictedPackageName?: string; // gcm for android
    dryRun?: boolean; // gcm for android
    icon?: string; // gcm for android
    tag?: string; // gcm for android
    color?: string; // gcm for android
    clickAction?: string; // gcm for android. In ios, category will be used if not supplied
    locKey?: string; // gcm, apn
    bodyLocArgs?: string; // gcm, apn
    titleLocKey?: string; // gcm, apn
    titleLocArgs?: string; // gcm, apn
    retries?: number; // gcm, apn
    encoding?: string; // apn
    badge?: number; // gcm for ios, apn
    sound?: string; // gcm, apn
    alert?: string | Object; // apn, will take precedence over title and body
    launchImage?: string; // apn and gcm for ios
    action?: string; // apn and gcm for ios
    topic?: string; // apn and gcm for ios
    category?: string; // apn and gcm for ios
    mdm?: string; // apn and gcm for ios
    urlArgs?: string; // apn and gcm for ios
    truncateAtWordEnd?: boolean; // apn and gcm for ios
    mutableContent?: number; // apn
    expiry?: number; // seconds
    timeToLive?: number; // if both expiry and timeToLive are given, expiry will take precedency
    headers?: { [key: string]: string | number | boolean }; // wns
    launch?: string; // wns
    duration?: string; // wns
    consolidationKey?: string; // ADM
  };

  export type SmsRequest = RequestMetadata & {
    from: string;
    to: string;
    text: string;
    type?: "text" | "unicode"; // Defaults to 'text'
    nature?: "marketing" | "transactional";
    ttl?: number;
    messageClass?: 0 | 1 | 2 | 3; // 0 for Flash SMS, 1 - ME-specific, 2 - SIM / USIM specific, 3 - TE-specific
    // } & (
    //   {type?: 'text', text: string}
    //   | {type: 'unicode', text: string}
    //   | {type: 'binary', body: string, udh: string, protocolId: string}
    //   | {type: 'wappush', title: string, url: string, validity?: number}
    //   | {type: 'vcal', vcal: string}
    //   | {type: 'vcard', vcard: string}
    // )
  };

  export type WebpushRequest = RequestMetadata & {
    subscription: {
      endpoint: string;
      keys: {
        auth: string;
        p256dh: string;
      };
    };
    title: string; // C22 F22 S6
    body: string; // C22 F22 S6
    actions?: {
      action: string;
      title: string;
      icon?: string;
    }[]; // C53
    badge?: string; // C53
    dir?: "auto" | "rtl" | "ltr"; // C22 F22 S6
    icon?: string; // C22 F22
    image?: string; // C55 F22
    redirects?: { [key: string]: string }; // added for local tests
    requireInteraction?: boolean; // C22 F52
  };

  export type SlackRequest = RequestMetadata & {
    text: string;
  };

  export type Request = EmailRequest | PushRequest | SmsRequest | WebpushRequest | SlackRequest;
}
