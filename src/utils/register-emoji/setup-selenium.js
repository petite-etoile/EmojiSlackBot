const os = require("os");
const chrome = require("selenium-webdriver/chrome");
const { Builder } = require("selenium-webdriver");

/**
 * Seleniumのドライバーをビルドする関数
 * @returns {WebDriver} - Seleniumのドライバー
 */
async function buildSeleniumDriver() {
  // ヘッドレスモードのオプションを設定
  const options = new chrome.Options();
  options.addArguments("--headless");

  // ヘッドレスモードでChromeを起動
  const builder = new Builder().forBrowser("chrome").setChromeOptions(options);

  // Linux（らずぱい）の場合はChromeDriverのパスを指定
  if (os.platform() === "linux") {
    builder.setChromeService(
      new chrome.ServiceBuilder("/usr/bin/chromedriver")
    );
  }
  return builder.build();
}

module.exports = buildSeleniumDriver;
