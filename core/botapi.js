const axios = require("axios");

const botQQ = 1587827933;
const apiUrl = "http://127.0.0.1:12001";

function sendGroupMessage(toGroup, message) {
    axios.get(`${apiUrl}/sendgroupmsg`, {
        params: {
            type: "",
            logonqq: botQQ,
            group: toGroup,
            msg: message,
            anonymous: false
        }
    }).then((res) => {
        console.log(`发送群聊消息 | ${toGroup} | ${message}`);
    }).catch((error) => {
        console.log(`群组消息发送错误\n${error}`);
    });
}

function sendPrivateMessage(toQQ, message) {
    axios.get(`${apiUrl}/sendprivatemsg`, {
        params: {
            type: "",
            logonqq: botQQ,
            toqq: toQQ,
            msg: message
        }
    }).then((res) => {
        console.log(`发送私聊消息 | ${toQQ} | ${message}`);
    }).catch((error) => {
        console.log(`私聊消息发送错误\n${error}`);
    });
}

module.exports = {
    sendGroupMessage,
    sendPrivateMessage
}