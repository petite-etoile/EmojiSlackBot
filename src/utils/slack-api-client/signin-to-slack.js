const { By, Key, until } = require("selenium-webdriver");

// 環境変数の読み込み
require("dotenv").config();
const workspace = process.env.SLACK_WORKSPACE;
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

/**
 * Slackにサインインする関数
 * @param {WebDriver} driver - Seleniumのドライバー
 * @returns {Promise<void>} - Promise
 */
async function signInToSlack(driver) {
  console.log("Signing in to Slack...");

  // Slackにアクセス
  await driver.get(
    `https://${workspace}.slack.com/sign_in_with_password?redir=%2Fcustomize%2Femoji#/`
  );

  // ログイン処理
  await driver.findElement(By.id("email")).sendKeys(email);
  await driver.findElement(By.id("password")).sendKeys(password, Key.RETURN);

  // 'boot_data'を含むscriptタグが読みこまれるのを待機 (api-tokenを取得するのに必要)
  await driver.wait(
    until.elementLocated(By.xpath("//script[contains(text(), 'boot_data')]")),
    10000
  );

  // カスタム絵文字セクションが読み込まれるの待機
  await driver.wait(until.elementLocated(By.id("list_emoji_section")), 10000);

  console.log("completed sign in to Slack");
}

module.exports = signInToSlack;
