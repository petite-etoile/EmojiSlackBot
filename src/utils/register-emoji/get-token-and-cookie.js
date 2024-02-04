/**
 * Seleniumを使ってサインインしてCookieとAPIトークンを取得する関数.
 * @returns {Promise<object>} - CookieとAPIトークン
 */
async function getCookieAndToken() {
  // Seleniumのドライバーをビルド
  const driver = await buildSeleniumDriver();

  try {
    // サインイン
    await signInToSlack(driver);

    cookie = await getCookie(driver);
    token = await getToken(driver);
  } finally {
    // ドライバーを終了
    await driver.quit();
  }
  return { cookie, token };
}

/**
 * Cookieを取得する関数
 * @param {WebDriver} driver - Seleniumのドライバー
 * @returns {Promise<string>} - Cookie
 */
async function getCookie(driver) {
  const cookies = await driver.manage().getCookies();
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

/**
 * APIトークンを取得する関数
 * @param {WebDriver} driver - Seleniumのドライバー
 * @returns {Promise<string>} - APIトークン
 */
async function getToken(driver) {
  return driver.executeScript("return window.boot_data.api_token;");
}

module.exports = getCookieAndToken;
