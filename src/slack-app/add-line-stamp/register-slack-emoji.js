// 自作モジュールの読み込み
const getCookieAndToken = require("@utils/register-emoji/get-token-and-cookie");
const registerSlackEmojiByTokenAndCookie = require("@utils/register-emoji/register-emoji-by-token-and-cookie");

/**
 * LINEスタンプをSlack絵文字として登録する関数
 * @param {string} emojiNamePrefix - 絵文字の登録名のプレフィックス
 * @param {string} stampsFilePathList - LINEスタンプの画像ファイルのパスのリスト
 * @returns {Promise<object[]>} - 絵文字の登録結果のリスト
 */
async function registerAllLineStampsToSlack(
  emojiNamePrefix,
  stampsFilePathList
) {
  // POSTリクエストに必要なCookieとAPIトークンを取得
  const { cookie, token } = await getCookieAndToken();

  // 全ての絵文字の登録処理を並列で実行
  const registrationPromises = stampsFilePathList.map((stampsFilePath, idx) => {
    const emojiName = `${emojiNamePrefix}_${idx}`;

    return registerSlackEmojiByTokenAndCookie(
      emojiName,
      stampsFilePath,
      cookie,
      token
    );
  });

  // すべての絵文字の登録処理が終わるまで待機
  const results = await Promise.all(registrationPromises);
  console.log(results);
  return results;
}

module.exports = registerAllLineStampsToSlack;
