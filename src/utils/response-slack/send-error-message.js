/**
 * Slackにエラーメッセージを投稿する関数
 * @param {function} say - Slackに投稿する関数
 * @param {object} command - Slackコマンド情報
 * @param {object} error - エラー情報
 */
async function sendErrorMessageToSlack(say, command, error) {
  console.log("start send error message to slack");
  const { ts } = await say(
    `\`${command["command"]} ${command["text"]}\`` +
      "\n" +
      `予期せぬエラーが発生しました`
  );

  // エラーメッセージ(詳細)
  const errorMessage = [
    `*Error Occurred*`,
    `>${error.message}`,
    `>Stack Trace:`,
    `\`\`\`${error.stack}\`\`\``,
  ].join("\n");

  console.log(errorMessage);
  say({
    text: errorMessage,
    thread_ts: ts,
  });
  console.log("end send error message to slack");
}

module.exports = sendErrorMessageToSlack;
