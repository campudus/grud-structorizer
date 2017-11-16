const structorizer = require("../index")("http://localhost:8181");

describe("resetSchema", () => {
  it("should call backend with nonce", () => {
    const result = structorizer.api.resetSchema("nonce");

    return expect(result).toEqual({"status": "ok"});
  });
});
