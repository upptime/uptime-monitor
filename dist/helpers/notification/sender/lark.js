"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLarkMsg = exports.checkMaybeSendLarkMsg = void 0;
const secrets_1 = require("../../secrets");
const axios_1 = __importDefault(require("axios"));
const core = __importStar(require("@actions/core"));
/**
 * Check if a lark message should be sent
 *
 * @returns boolean
 */
function checkMaybeSendLarkMsg() {
    if ((0, secrets_1.getSecret)("NOTIFICATION_LARK")) {
        return true;
    }
    return false;
}
exports.checkMaybeSendLarkMsg = checkMaybeSendLarkMsg;
/**
 * Send a lark message
 *
 * @param message
 * @returns Promise<void>
 */
async function sendLarkMsg(defaultMessage, config) {
    const { message, url } = config ?? {};
    core.info("Sending lark message");
    const urlToSend = url || (0, secrets_1.getSecret)("NOTIFICATION_LARK_BOT_WEBHOOK");
    const messageToSend = message || defaultMessage;
    core.debug(`URL: ${urlToSend}`);
    core.debug(`Message: ${messageToSend}`);
    try {
        await axios_1.default.post(urlToSend, {
            msg_type: "interactive",
            card: {
                config: {
                    wide_screen_mode: true,
                },
                elements: [
                    {
                        tag: "markdown",
                        content: messageToSend.replace(/_/g, "\\_"),
                    },
                ],
            },
        });
        console.log("Success Lark");
    }
    catch (error) {
        console.log("Got an error", error);
    }
    console.log("Finished sending Lark");
}
exports.sendLarkMsg = sendLarkMsg;
//# sourceMappingURL=lark.js.map