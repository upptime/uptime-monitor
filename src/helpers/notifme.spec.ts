import { getSecret } from "./secrets";
import axios from "axios";
import { sendNotification } from "./notifme";

jest.mock("axios");

describe("sendNotification", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("test send zulip notification", async () => {
    const content = "Jest notification";
    const username = "upptime-bot@domain.zulipchat.com";
    const password = "123123123";
    const url =
      "https://domain.zulipchat.com/api/v1/messages?type=stream&to=general&topic=Upptime%20notifications";
    process.env.NOTIFICATION_ZULIP_MESSAGE_URL = url;
    process.env.NOTIFICATION_ZULIP_API_KEY = password;
    process.env.NOTIFICATION_ZULIP_API_EMAIL = username;

    await sendNotification(content);
    expect(axios.request).toHaveBeenCalledWith({
      url: url,
      method: "post",
      auth: { username: username, password: password },
      params: { content },
    });
  });
});
