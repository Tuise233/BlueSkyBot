const fs = require("fs");
const { resolve } = require("path");
const { sendGroupMessage } = require("../core/botapi");
const slavePath = `${resolve("./")}\\assets\\slave.json`;

function getSlaveData(){
    return JSON.parse(fs.readFileSync(slavePath));
}

function updateSlaveData(dataString){
    fs.writeFileSync(slavePath, JSON.stringify(dataString, null, "\t"));
}

function resolveSlaveNumber(slaveNumber){
    return slaveNumber.replace("[", "").replace("]", "").replace("@", "");
}

function initSlaveSystem(groupNumber, userNumber = null, slaveNumber = null) {
    let data = getSlaveData();
    if (data[groupNumber] == undefined) {
        data[groupNumber] = {};
    }
    if(userNumber != null){
        if(data[groupNumber][userNumber] == undefined){
            data[groupNumber][userNumber] = {
                "money": 1000,
                "cooldown": "",
                "value": 0,
                "slaves": [],
                "isSlave": false,
                "owner": "",
            };
        }
    }
    if(slaveNumber != null){
        if(data[groupNumber][slaveNumber] == undefined){
            data[groupNumber][slaveNumber] = {
                "money": 1000,
                "cooldown": "",
                "value": 0,
                "slaves": [],
                "isSlave": false,
                "owner": "",
            };
        }
    }
    updateSlaveData(data);
}
/* ====== 奴隶系统函数 ====== */
function isAt(slaveNumber){
    let number = slaveNumber.replace("[", "").replace("]", "").replace("@", "");
    if(new Number(number).toString() == "NaN") return false;
    return slaveNumber.includes("@");
}

function At(userNumber){
    return `[@${userNumber}]`;
}

function isSlave(groupNumber, userNumber){
    return getSlaveData()[groupNumber][userNumber]["isSlave"];
}

function getSlaveOwner(groupNumber, userNumber){
    return getSlaveData()[groupNumber][userNumber]["owner"];
}

function getSlaveAmount(groupNumber, userNumber){
    return getSlaveData()[groupNumber][userNumber]["slaves"].length;
}

function getMoney(groupNumber, userNumber){
    return getSlaveData()[groupNumber][userNumber]["money"];
}

function getValue(groupNumber, userNumber){
    return getSlaveData()[groupNumber][userNumber]["value"];
}

function attachSlaveToOwner(groupNumber, ownerNumber, slaveNumber){
    let data = getSlaveData();
    data[groupNumber][ownerNumber]["slaves"].push(slaveNumber);
    data[groupNumber][ownerNumber]["money"] -= 500;
    data[groupNumber][slaveNumber]["value"] += 500;
    data[groupNumber][slaveNumber]["owner"] = ownerNumber;
    data[groupNumber][slaveNumber]["isSlave"] = true;
    updateSlaveData(data);
}

function detachSlaveToOwner(groupNumber, ownerNumber, slaveNumber){
    let data = getSlaveData();
    let array = data[groupNumber][ownerNumber]["slaves"];
    for(let i = 0; i < array.length; i++){
        if(array[i] == slaveNumber){
            array.splice(i, 1);
            break;
        }
    }
    data[groupNumber][ownerNumber]["slaves"] = array;
    data[groupNumber][ownerNumber]["money"] += 100;
    data[groupNumber][slaveNumber]["owner"] = "";
    data[groupNumber][slaveNumber]["isSlave"] = false;
    updateSlaveData(data);
}

/* ====== 功能函数 ====== */
function catchSlave(groupNumber, ownerNumber, slaveNumber){
    if(!isAt(slaveNumber[0])) return;
    slaveNumber = resolveSlaveNumber(slaveNumber[0]);
    initSlaveSystem(groupNumber, ownerNumber, slaveNumber);
    //判断奴隶主是否为奴隶
    if(isSlave(groupNumber, ownerNumber)){
        sendGroupMessage(groupNumber, "你现在是其他人的纵火犯，你还想抓纵火犯？！");
        return;
    }
    if(ownerNumber == slaveNumber){
        sendGroupMessage(groupNumber, "你想抓自己做自己的纵火犯？什么自虐癖");
        return;
    }
    //判断目标是否已经是别人的奴隶
    if(isSlave(groupNumber, slaveNumber)){
        if(getSlaveOwner(groupNumber, slaveNumber) == ownerNumber){
            sendGroupMessage(groupNumber, `${At(ownerNumber)}\n${At(slaveNumber)}已经是你的纵火犯了`);
        } else {
            sendGroupMessage(groupNumber, `${At(ownerNumber)}\n${At(slaveNumber)}已经被其他人抓走了`);
        }
        return;
    }
    if(getMoney(groupNumber, ownerNumber) < 500){
        sendGroupMessage(groupNumber, `${At(ownerNumber)}\n你没有500刀乐 你怎么雇他做你的纵火犯？`);
        return;
    }
    attachSlaveToOwner(groupNumber, ownerNumber, slaveNumber);
    sendGroupMessage(groupNumber, `${At(ownerNumber)}\n你成功抓到${At(slaveNumber)}成为你的纵火犯！\n当前存款：${getMoney(groupNumber, ownerNumber)}刀乐\n当前纵火犯身价：${getValue(groupNumber, slaveNumber)}刀乐`);
}

function releaseSlave(groupNumber, ownerNumber, slaveNumber){
    if(!isAt(slaveNumber[0])) return;
    slaveNumber = resolveSlaveNumber(slaveNumber[0]);
    initSlaveSystem(groupNumber, ownerNumber, slaveNumber);
    //判断奴隶主是否为奴隶
    if(isSlave(groupNumber, ownerNumber)){
        sendGroupMessage(groupNumber, "你现在是其他人的纵火犯，你觉得你还有纵火犯吗？");
        return;
    }
    if(ownerNumber == slaveNumber){
        sendGroupMessage(groupNumber, "什么释放自我，啥b！");
        return;
    }
    if(isSlave(groupNumber, slaveNumber)){
        if(getSlaveOwner(groupNumber, slaveNumber) == ownerNumber){
            detachSlaveToOwner(groupNumber, ownerNumber, slaveNumber);
            sendGroupMessage(groupNumber, `${At(ownerNumber)}\n你主动释放你的纵火犯${At(slaveNumber)}，火神决定奖励你100刀乐\n当前存款：${getMoney(groupNumber, ownerNumber)}`);
        } else {
            sendGroupMessage(groupNumber, `${At(ownerNumber)}\n${At(slaveNumber)}又不是你的纵火犯，跟你有勾八关系？`);
        }
    } else {
        sendGroupMessage(groupNumber, `${At(ownerNumber)}\n${At(slaveNumber)}目前不是任何人的纵火犯`);
    }
}

module.exports = {
    catchSlave,
    releaseSlave
}