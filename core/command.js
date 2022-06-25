const { sendGroupMessage, sendPrivateMessage } = require("./botapi");
const { muteGroups } = require("./commandHandle");

let commands = [];

/*
cmd: 指令 string
params: 参数 array
handle: 函数 function
mute: 是否被禁言影响 bool
*/
function registerCommand(cmd, params, handle, mute = true) {
    //判断cmd是否存在与commands
    let exist = false;
    for (let i = 0; i < commands.length; i++) {
        if (commands[i].command == cmd) {
            exist = true;
            break;
        }
    }

    if (!exist) {
        commands.push({
            command: cmd,
            params: params,
            handle: handle,
            mute: mute
        });
        console.log(`兰天机器人 | 注册消息命令 | ${cmd} | 成功`);
    }
}

/*
type: 类型 private, group string
fromNumber: QQ帐号或QQ群号 string
senderNumber: QQ帐号或QQ群成员帐号
word: 完整消息文本内容 string
*/
function checkCommand(type, fromNumber, senderNumber, word) {
    let cmd = null;
    if (word[0] == "?") {
        if (word.includes("-")) {
            cmd = word.split("-")[0];
        } else {
            cmd = word;
        }

        for (let i = 0; i < commands.length; i++) {
            if (commands[i].command == cmd) {
                //判断是否有参数
                if (word.split("-")[0] == word && commands[i].params.length == 0) {
                    //没有参数，执行handle
                    if (type == "group" && muteGroups.includes(fromNumber) && commands[i].mute == true) return;
                    commands[i].handle(fromNumber, senderNumber);
                } else {
                    //有参数，判断参数是否完整
                    let len = word.split("-").length;
                    let params = word.split("-").splice(1, len);
                    if (params.length == commands[i].params.length) {
                        //参数完整
                        if (type == "group" && muteGroups.includes(fromNumber) && commands[i].mute == true) return;
                        commands[i].handle(fromNumber, senderNumber, params);
                    } else {
                        if (type == "group" && muteGroups.includes(fromNumber) && commands[i].mute == true) return;
                        //参数过少或过多
                        let result = `命令参数不完整，命令示例：\n${commands[i].command}-`;
                        for (let j = 0; j < commands[i].params.length; j++) {
                            result += `${commands[i].params[j]}`;
                            if (j < commands[i].params.length - 1) {
                                result += "-";
                            }
                        }
                        switch (type) {
                            case "private": {
                                sendPrivateMessage(senderNumber, result);
                                break;
                            }

                            case "group": {
                                sendGroupMessage(fromNumber, result);
                                break;
                            }
                        }
                    }
                }
                break;
            }
        }
    }
}

module.exports = {
    registerCommand,
    checkCommand
}