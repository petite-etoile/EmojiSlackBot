const { saveLineStamps } = require("@utils/line-stamp/line-stamp-util");
const registerAllLineStampsToSlack = require("@slack-app/add-line-stamp/register-slack-emoji");
const { convertResultsToString } = require("@utils/json-converter");
const {
  validateAddLineStampCommandArgs,
} = require("@utils/validator/command-args-validator");
const sendErrorMessageToSlack = require("@utils/response-slack/send-error-message");

require("dotenv").config();
const targetChannelName = process.env.LINESTAMP_CHANNEL_NAME;

/**
 * /add-line-stampコマンドを叩かれたら呼ばれる関数
 *
 * 1. 引数のチェック
 * 2. LINEスタンプを保存（スクレイピング）
 * 3. LINEスタンプをSlack絵文字として登録
 * 4. Slackに結果を投稿
 * @param {function} ack - コマンドを受け取ったことをSlackに返す関数
 * @param {object} command - Slackコマンド情報
 * @param {function} say - Slackに投稿する関数
 * @returns {void}
 */
async function handleAddLineStampCommand(ack, command, say) {
  console.log(
    "\n\n============================ handle Add Line Stamp Command ============================\n"
  );
  console.log(command);

  // devチャンネルと本番チャンネルで分けて実行するための場合わけ
  if (command.channel_name !== targetChannelName) {
    console.log("対象のチャンネルでのコマンドじゃないのでスルーします");
    console.log("対象のチャンネル: " + targetChannelName);
    return;
  }

  try {
    // コマンドを受け取ったことを確認
    await ack();

    // コマンドの引数をチェックして不適切だったらエラーメッセージを返す
    const error_message = validateAddLineStampCommandArgs(command);
    if (error_message) {
      await say(error_message);
      return;
    }

    // コマンドの引数をパース
    const [url, stamp_name] = command.text.split(" ");

    // LINEスタンプを保存
    const stamps_file_paths = await saveLineStamps(url, stamp_name);

    // LINEスタンプをSlack絵文字として登録
    const result = await registerLineStampsToSlack(
      stamp_name,
      stamps_file_paths
    );

    // Slackに結果を投稿
    await postResultToChannel(say, command, result);
  } catch (error) {
    // slack側にもエラーメッセージを投稿する
    sendErrorMessageToSlack(say, command, error);
  }
}

/**
 * LINEスタンプをSlack絵文字として登録する関数
 * @param {string} stampName - 登録する絵文字の名前
 * @param {string} stampsFilePaths - 保存したLINEスタンプのファイルパスのリスト
 * @returns {array<object>} - 絵文字の登録結果のリスト
 */
async function registerLineStampsToSlack(stampName, stampsFilePaths) {
  console.log("start register line stamps to slack");

  const result = await registerAllLineStampsToSlack(stampName, stampsFilePaths);

  console.log("end register line stamps to slack");
  return result;
}

/**
 * Slackに結果を投稿する関数
 * @param {function} say - Slackに投稿する関数
 * @param {object} command - Slackコマンド情報
 * @param {array<object>} results - 絵文字の登録結果
 * @returns {void}
 */
async function postResultToChannel(say, command, results) {
  console.log("start post results to channel");

  // Slackに投稿するメッセージ（1個目)
  const responseMessageList = getResponseMessageList(command, results);
  console.log(responseMessageList.join("\n"));
  const { ts } = await say(responseMessageList.join("\n"));

  // 続けてスレッドに（resultsをそのまま）投稿する。登録した絵文字を削除するときに使用。
  await say({
    text: "```" + convertResultsToString(results) + "```",
    thread_ts: ts,
  });

  console.log("end post result to channel");
}

/**
 * Slackに投稿するメッセージを生成して返却する関数
 * @param {object} command - Slackコマンド情報
 * @param {array<object>} results - 絵文字の登録結果
 * @returns {array<string>} - Slackに投稿するメッセージ
 */
function getResponseMessageList(command, results) {
  responseMessageList = [
    `\`${command["command"]} ${command["text"]}\``,
    "*=============== 結果 ===============*",
  ];
  for (const result of results) {
    if (result.ok) {
      responseMessageList.push(
        `:${result.name}: 登録成功 \`:${result.name}:\``
      );
    } else {
      const errorMessage =
        result.error === "error_name_taken"
          ? `すでに存在する絵文字名です`
          : result.error;

      responseMessageList.push(
        `:${result.name}: 登録失敗 (${errorMessage}) \`:${result.name}:\``
      );
    }
  }
  return responseMessageList;
}

module.exports = handleAddLineStampCommand;
