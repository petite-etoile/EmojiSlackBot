const getCookieAndToken = require("utils/register-emoji/get-token-and-cookie");
const {
  registerSlackEmojiByTokenAndCookie,
} = require("utils/register-emoji/register-emoji");

/**
 * slack絵文字をtokenとcookieを使って登録するテスト
 */

describe("registerSlackEmojiByTokenAndCookie", () => {
  test("registerSlackEmojiTest", async () => {
    const { cookie, token } = await getCookieAndToken();
    console.log("cookie: " + cookie);
    console.log("token: " + token);

    const emojiName = "test";
    const stampsFilePath = "images/test.png";

    const result = await registerSlackEmojiByTokenAndCookie(
      emojiName,
      stampsFilePath,
      cookie,
      token
    );
    console.log(result);
  }, 1000000);
});
