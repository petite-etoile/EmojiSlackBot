const path = require("path");
const buildSeleniumDriver = require("../../utils/slack-api-client/setup-selenium");
const signInToSlack = require("../../utils/slack-api-client/signin-to-slack");
const {
  registerOneLineStampToSlack,
  insertUploadForm,
} = require("../../utils/slack-api-client/register-emoji");

/**
 * LINEスタンプをSlack絵文字として登録する関数
 * @param {string} emojiNamePrefix - 絵文字の登録名のプレフィックス
 * @param {string} stampsFilePathList - LINEスタンプの画像ファイルのパスのリスト
 * @returns {object[]} - 絵文字の登録結果のリスト
 */
async function registerAllLineStampsToSlack(
  emojiNamePrefix,
  stampsFilePathList
) {
  // Seleniumのドライバーをビルド
  const driver = await buildSeleniumDriver();

  let results = null;
  try {
    // サインイン
    await signInToSlack(driver);

    // 各絵文字のアップロード用のフォーム挿入
    for (let idx = 0; idx < stampsFilePathList.length; idx++) {
      await insertUploadForm(driver, idx);
    }

    // 全ての絵文字の登録処理を並列で実行
    const registrationPromises = stampsFilePathList.map(
      (stampsFilePath, idx) => {
        const emojiName = `${emojiNamePrefix}_${idx}`;
        const stampsAbsoluteFilePath = path.resolve(stampsFilePath);

        return registerOneLineStampToSlack(
          driver,
          emojiName,
          stampsAbsoluteFilePath,
          idx
        );
      }
    );
    // すべての絵文字の登録処理が終わるまで待機
    results = await Promise.all(registrationPromises);
  } catch (error) {
    results = error;
  } finally {
    // ドライバーを終了
    await driver.quit();
  }
  console.log(results);
  return results;
}

module.exports = registerAllLineStampsToSlack;
