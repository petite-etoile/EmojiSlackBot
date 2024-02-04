const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

//環境変数の読み込み
require("dotenv").config();
const workspace = process.env.SLACK_WORKSPACE;

/**
 * 画像を一つ、Slack絵文字として登録する関数
 * @param {string} emojiName - 絵文字の登録名
 * @param {string} stampsFilePath - LINEスタンプの画像ファイルのパス
 * @param {string} cookie - Cookie
 * @param {string} token - APIトークン
 * @returns {Promise<object>} - 絵文字の登録結果
 */
async function registerSlackEmojiByTokenAndCookie(
  emojiName,
  stampsFilePath,
  cookie,
  token
) {
  const url = `https://${workspace}.slack.com/api/emoji.add`;

  // FormData作成
  const formData = new FormData();
  const file = fs.createReadStream(stampsFilePath);
  formData.append("name", emojiName);
  formData.append("image", file);
  formData.append("token", token);
  formData.append("mode", "data");

  return axios
    .post(url, formData, {
      headers: {
        Cookie: cookie,
      },
    })
    .then((response) => {
      return { name: emojiName, ...response.data };
    })
    .catch((error) => {
      return { name: emojiName, error };
    });
}

module.exports = registerSlackEmojiByTokenAndCookie;
