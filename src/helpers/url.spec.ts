import { remove } from "fs-extra";
import { removeUrlProtocol } from "./url";

describe("removeUrlProtocol", () => {
    it("should remove http protocol from url", () => {
        let cname = "http://www.google.com";
        expect(removeUrlProtocol(cname)).toEqual("www.google.com");
    });

    it("should remove https protocol from url", () => {
        let cname = "https://www.google.com";
        expect(removeUrlProtocol(cname)).toEqual("www.google.com");
    });

    it("should not do anything if there are no http/s in url", () => {
        let cname = "www.google.com";
        expect(removeUrlProtocol(cname)).toEqual("www.google.com");
    });
});
