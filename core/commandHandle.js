const { selfPics } = require("../assets/photos");
const { sendGroupMessage } = require("./botapi");
const { addWord, getWordsKey, deleteWord } = require("../util/words")

let keywords = [];
let muteGroups = [];

function commandInit() {
    keywords = getWordsKey();
    console.log(`兰天机器人 | 获取默认词库成功,词库数量: ${keywords.length}`);
}

function groupAddKeyword(fromNumber, senderNumber, params) {
    addWord(params[0], params[1]);
    sendGroupMessage(fromNumber, "作为一名专业的播音主持人，你让我记住什么，我肯定会记得非常清楚");
    keywords = getWordsKey();
}

function groupRemoveKeyword(fromNumber, senderNumber, params) {
    deleteWord(params[0]);
    sendGroupMessage(fromNumber, `我错力，我再也不说${params[0]}力，，，`);
    keywords = getWordsKey();
}

function sendBlueSkyPhoto(fromNumber, senderNumber) {
    sendGroupMessage(fromNumber, selfPics[random(0, selfPics.length)]);
}

function enableBlueSky(fromNumber, senderNumber) {
    if (muteGroups.includes(fromNumber)) {
        sendGroupMessage(fromNumber, "各位观众晚上好，我是新时代网红青年主持人兰天");
        for (let i = 0; i < muteGroups.length; i++) {
            if (muteGroups[i] == fromNumber) {
                muteGroups.splice(i, 1);
                break;
            }
        }
    }
}

function disableBlueSky(fromNumber, senderNumber) {
    if (!muteGroups.includes(fromNumber)) {
        sendGroupMessage(fromNumber, "彳亍，你不让我说话 那我就不说，，，");
        muteGroups.push(fromNumber);
    }
}

function random(start, end) {
    return Math.floor(Math.random() * (end - start) + start)
}

module.exports = {
    muteGroups,
    commandInit,
    groupAddKeyword,
    groupRemoveKeyword,
    sendBlueSkyPhoto,
    enableBlueSky,
    disableBlueSky
}