const { By } = require("selenium-webdriver");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

// formのidのプレフィックス
const uploadFormIdPrefix = "petit_upload_form";
const emojiNameInputIdPrefix = "petit_emoji_name_input";
const emojiFileInputIdPrefix = "petit_emoji_file_input";
const tokenInputIdPrefix = "petit_token_input";
const modeInputIdPrefix = "petit_mode_input";

const workspace = process.env.SLACK_WORKSPACE;

/**
 * 1つのLINEスタンプをSlack絵文字として登録する関数
 * @param {object} driver - Seleniumのドライバー
 * @param {string} emojiName - 絵文字の登録名
 * @param {string} stampsFilePath - LINEスタンプの画像ファイルのパス
 * @param {number} idx - フォームのインデックス
 * @returns {object} - 絵文字の登録結果
 */
async function registerOneLineStampToSlack(
  driver,
  emojiName,
  stampsFilePath,
  idx
) {
  // フォームのidを設定
  const uploadFormId = uploadFormIdPrefix + idx.toString();
  const emojiNameInputId = emojiNameInputIdPrefix + idx.toString();
  const emojiFileInputId = emojiFileInputIdPrefix + idx.toString();

  // ファイルパスと絵文字名の設定
  const fileInput = await driver.findElement(By.id(emojiFileInputId));
  const emojiNameInput = await driver.findElement(By.id(emojiNameInputId));

  // フォームに値を入力
  await fileInput.sendKeys(stampsFilePath);
  await emojiNameInput.sendKeys(emojiName);

  // フォームを送信するスクリプト
  const sendEmojiAddFormScript = `
    const workspace = '${workspace}';
    const form = document.querySelector('#${uploadFormId}');
    const formData = new FormData(form);

    const response_json = await fetch(\`https://\${workspace}.slack.com/api/emoji.add\`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    })
      .then(response => {
        console.log(response);
        return response.json();
      })
      .then(data => arguments[arguments.length-1](data)) // コールバック関数を実行して終了したことを伝える
      .catch(error => arguments[arguments.length-1]({ error: error.toString() }));
  `;

  const result = await driver
    .executeAsyncScript(sendEmojiAddFormScript)
    .then((result) => {
      return { name: emojiName, ...result };
    });
  console.log(
    `----------------------------------------------------------------
result of registering :${emojiName}:
${JSON.stringify(result, null, 2)}
----------------------------------------------------------------`
  );

  return result;
}

/**
 * 1つのLINEスタンプをSlack絵文字として登録する関数
 * @param {object} driver - Seleniumのドライバー
 * @param {number} idx - フォームのインデックス
 */
async function insertUploadForm(driver, idx) {
  console.log("Inserting upload form...");

  // フォームのidを設定
  const uploadFormId = uploadFormIdPrefix + idx.toString();
  const emojiNameInputId = emojiNameInputIdPrefix + idx.toString();
  const emojiFileInputId = emojiFileInputIdPrefix + idx.toString();
  const tokenInputId = tokenInputIdPrefix + idx.toString();
  const modeInputId = modeInputIdPrefix + idx.toString();

  // ページにフォームを挿入するスクリプト
  const insertUploadFormScript = `
    const uploadFormId = "${uploadFormId}";
    const form = document.createElement('form');
    const token = window.boot_data.api_token;
    
    form.id = uploadFormId;
    form.innerHTML = \`
        <input id="${emojiNameInputId}" name="name">
        <input type="file" id="${emojiFileInputId}" name="image">
        <input type="hidden" id="${tokenInputId}" name="token" value="\${token}">
        <input type="hidden" id="${modeInputId}" name="mode" value="data">
    \`;
    document.body.append(form);
  `;

  await driver.executeScript(insertUploadFormScript);

  console.log("completed insert upload form");
}

module.exports = {
  registerOneLineStampToSlack,
  insertUploadForm,
};
