const http = require("http");
const { checkCommand, registerCommand } = require("./core/command");
const { groupAddKeyword, groupRemoveKeyword, sendBlueSkyPhoto, disableBlueSky, enableBlueSky, commandInit, showGitHub, checkKeyword } = require("./core/commandHandle");
const { catchSlave, releaseSlave, burnBuilding } = require("./util/slave");

//机器人配置
const listenerPort = 12000;
const botQQ = 1587827933;

let Groups = [
    782675156,
    //737580252,
    273981842,
    // 102874450
];

//机器人启动
function botInitialize() {
    const server = http.createServer((req, res) => {
        req.on("data", (chunk) => {
            eventListener(chunk);
        });
        res.end("");
    });

    server.listen(listenerPort);
    console.log(`兰天机器人 | 启动成功,监听地址: http://localhost:${listenerPort}`);

    //注册基础命令
    commandInit();
    registerCommand("?兰天源码", [], showGitHub, false);
    registerCommand("?添加词库", ["关键词", "回答"], groupAddKeyword);
    registerCommand("?删除词库", ["关键词"], groupRemoveKeyword);
    registerCommand("?来张自拍", [], sendBlueSkyPhoto);
    registerCommand("?兰天闭嘴", [], disableBlueSky, false);
    registerCommand("?兰天说话", [], enableBlueSky, false);

    //奴隶系统指令
    registerCommand("?抓纵火犯", ["At目标"], catchSlave);
    registerCommand("?放纵火犯", ["At目标"], releaseSlave);
    registerCommand("?烧写字楼", [], burnBuilding);
}

function eventListener(object) {
    try {
        let decodeObject = decodeURI(object);
        object = JSON.parse(decodeObject);
        if (object["type"] != undefined) {
            switch (object["type"]) {
                case "groupmsg": {
                    if (object["fromqq"]["qq"] != botQQ) {
                        onGroupMessage(object["fromgroup"], object["fromqq"], object["msg"]["msg"]);
                    }
                    break;
                }

                case "private": {
                    if (object["fromqq"]["qq"] != botQQ) {
                        onPrivateMessage(object["fromqq"], object["msg"]["msg"]);
                    }
                    break;
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function onGroupMessage(groupObject, senderObject, message) {
    try {
        console.log(`兰天机器人 | 收到群聊消息 | QQ群: ${groupObject["group"]} | 发送者: ${senderObject["qq"]} | 内容: ${message}`);
        if (Groups.includes(groupObject["group"])) {
            if (!checkCommand("group", groupObject["group"], senderObject["qq"], message)) {
                checkKeyword(groupObject["group"], senderObject["qq"], message);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function onPrivateMessage(senderObject, message) {
    console.log(`兰天机器人 | 收到私聊消息 | 发送者: ${senderObject["qq"]} | 内容: ${message}`);
}


botInitialize();