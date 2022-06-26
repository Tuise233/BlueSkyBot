const fs = require("fs");
const { resolve } = require("path");
const { sendGroupMessage } = require("../core/botapi");
const slavePath = `${resolve("./")}\\assets\\slave.json`;

function getSlaveData() {
    return JSON.parse(fs.readFileSync(slavePath));
}

function updateSlaveData(dataString) {
    fs.writeFileSync(slavePath, JSON.stringify(dataString, null, "\t"));
}

function resolveSlaveNumber(slaveNumber) {
    let start = -1, end = -1;
    for(let i = 0; i < slaveNumber.length; i++){
        if(slaveNumber[i] == "["){
            start = i + 1;
            break;
        }
    }
    
    if(start != -1){
        for(let i = 0; i < slaveNumber.length; i++){
            if(slaveNumber[i] == "]" && i > start){
                end = i;
                break;
            }
        }

        if(end != -1){
            return slaveNumber.substring(start, end).replace("@", "");
        } else return "undefined";
    } else return "undefined";
}

function initSlaveSystem(groupNumber, userNumber = null, slaveNumber = null) {
    let data = getSlaveData();
    if (data[groupNumber] == undefined) {
        data[groupNumber] = {};
    }
    if (userNumber != null) {
        if (data[groupNumber][userNumber] == undefined) {
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
    if (slaveNumber != null) {
        if (data[groupNumber][slaveNumber] == undefined) {
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
function isAt(slaveNumber) {
    let number = slaveNumber.replace("[", "").replace("]", "").replace("@", "");
    if (new Number(number).toString() == "NaN") return false;
    return slaveNumber.includes("@");
}

function At(userNumber) {
    return `[@${userNumber}]`;
}

function isSlave(groupNumber, userNumber) {
    return getSlaveData()[groupNumber][userNumber]["isSlave"];
}

function getSlaveOwner(groupNumber, userNumber) {
    return getSlaveData()[groupNumber][userNumber]["owner"];
}

function getSlaveAmount(groupNumber, userNumber) {
    return getSlaveData()[groupNumber][userNumber]["slaves"].length;
}

function getMoney(groupNumber, userNumber) {
    return getSlaveData()[groupNumber][userNumber]["money"];
}

function giveMoney(groupNumber, userNumber, money) {
    let data = getSlaveData();
    data[groupNumber][userNumber]["money"] += money;
    updateSlaveData(data);
}

function getValue(groupNumber, userNumber) {
    return getSlaveData()[groupNumber][userNumber]["value"];
}

function giveValue(groupNumber, userNumber, value) {
    let data = getSlaveData();
    data[groupNumber][userNumber]["value"] += value;
    updateSlaveData(data);
}

function getSlaves(groupNumber, userNumber) {
    return getSlaveData()[groupNumber][userNumber]["slaves"];
}

function getOwners(groupNumber, userNumber) {
    let data = getSlaveData();
    let owners = [];
    Object.keys(data[groupNumber]).forEach((owner) => {
        if(data[groupNumber][owner]["slaves"].length > 0 && owner != userNumber){
            owners.push(owner);
        }
    });
    return owners;
}

function attachSlaveToOwner(groupNumber, ownerNumber, slaveNumber) {
    let data = getSlaveData();
    data[groupNumber][ownerNumber]["slaves"].push(slaveNumber);
    data[groupNumber][ownerNumber]["money"] -= 500;
    data[groupNumber][slaveNumber]["value"] += 500;
    data[groupNumber][slaveNumber]["owner"] = ownerNumber;
    data[groupNumber][slaveNumber]["isSlave"] = true;
    updateSlaveData(data);
}

function detachSlaveToOwner(groupNumber, ownerNumber, slaveNumber) {
    let data = getSlaveData();
    let array = data[groupNumber][ownerNumber]["slaves"];
    for (let i = 0; i < array.length; i++) {
        if (array[i] == slaveNumber) {
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

function getCooldown(groupNumber, ownerNumber) {
    return getSlaveData()[groupNumber][ownerNumber]["cooldown"];
}

function checkCooldownOver(groupNumber, ownerNumber) {
    let cooldown = getCooldown(groupNumber, ownerNumber);
    if (cooldown == "") return true;
    return Math.abs(Number(cooldown) - Number(Date.now())) >= (60 * 1000);
}

function updateCooldown(groupNumber, ownerNumber) {
    let data = getSlaveData();
    data[groupNumber][ownerNumber]["cooldown"] = Date.now();
    updateSlaveData(data);
}

function random(start, end) {
    return Math.floor(Math.random() * (end - start) + start)
}

/* ====== 功能函数 ====== */
function catchSlave(groupNumber, ownerNumber, slaveNumber) {
    if (!isAt(slaveNumber[0])) return;
    slaveNumber = resolveSlaveNumber(slaveNumber[0]);
    initSlaveSystem(groupNumber, ownerNumber, slaveNumber);
    //判断奴隶主是否为奴隶
    if (isSlave(groupNumber, ownerNumber)) {
        sendGroupMessage(groupNumber, "你现在是其他人的纵火犯，你还想抓纵火犯？！");
        return;
    }
    if (ownerNumber == slaveNumber) {
        sendGroupMessage(groupNumber, "你想抓自己做自己的纵火犯？什么自虐癖");
        return;
    }
    //判断目标是否有奴隶
    if (getSlaveAmount(groupNumber, slaveNumber) > 0) {
        sendGroupMessage(groupNumber, "他现在拥有纵火犯，你不能抓他成为你的纵火犯");
        return;
    }
    //判断目标是否已经是别人的奴隶
    if (isSlave(groupNumber, slaveNumber)) {
        if (getSlaveOwner(groupNumber, slaveNumber) == ownerNumber) {
            sendGroupMessage(groupNumber, `${At(ownerNumber)}\n${At(slaveNumber)}已经是你的纵火犯了`);
        } else {
            sendGroupMessage(groupNumber, `${At(ownerNumber)}\n${At(slaveNumber)}已经被其他人抓走了`);
        }
        return;
    }
    if (getMoney(groupNumber, ownerNumber) < 500) {
        sendGroupMessage(groupNumber, `${At(ownerNumber)}\n你没有500刀乐 你怎么雇他做你的纵火犯？`);
        return;
    }
    attachSlaveToOwner(groupNumber, ownerNumber, slaveNumber);
    sendGroupMessage(groupNumber, `${At(ownerNumber)}\n你成功抓到${At(slaveNumber)}成为你的纵火犯！\n当前存款：${getMoney(groupNumber, ownerNumber)}刀乐\n当前纵火犯身价：${getValue(groupNumber, slaveNumber)}刀乐`);
}

function releaseSlave(groupNumber, ownerNumber, slaveNumber) {
    if (!isAt(slaveNumber[0])) return;
    slaveNumber = resolveSlaveNumber(slaveNumber[0]);
    initSlaveSystem(groupNumber, ownerNumber, slaveNumber);
    //判断奴隶主是否为奴隶
    if (isSlave(groupNumber, ownerNumber)) {
        sendGroupMessage(groupNumber, "你现在是其他人的纵火犯，你觉得你还有纵火犯吗？");
        return;
    }
    if (ownerNumber == slaveNumber) {
        sendGroupMessage(groupNumber, "什么释放自我，啥b！");
        return;
    }
    if (isSlave(groupNumber, slaveNumber)) {
        if (getSlaveOwner(groupNumber, slaveNumber) == ownerNumber) {
            detachSlaveToOwner(groupNumber, ownerNumber, slaveNumber);
            sendGroupMessage(groupNumber, `${At(ownerNumber)}\n你主动释放你的纵火犯${At(slaveNumber)}，火神决定奖励你100刀乐\n当前存款：${getMoney(groupNumber, ownerNumber)}`);
        } else {
            sendGroupMessage(groupNumber, `${At(ownerNumber)}\n${At(slaveNumber)}又不是你的纵火犯，跟你有勾八关系？`);
        }
    } else {
        sendGroupMessage(groupNumber, `${At(ownerNumber)}\n${At(slaveNumber)}目前不是任何人的纵火犯`);
    }
}

function burnBuilding(groupNumber, ownerNumber) {
    initSlaveSystem(groupNumber, ownerNumber);
    if (isSlave(groupNumber, ownerNumber)) {
        sendGroupMessage(groupNumber, "你现在是其他人的纵火犯，你不能主动烧写字楼");
        return;
    }
    if (getSlaveAmount(groupNumber, ownerNumber) == 0) {
        sendGroupMessage(groupNumber, "你目前没有纵火犯，无法烧写字楼");
        return;
    }
    if (checkCooldownOver(groupNumber, ownerNumber)) {
        let slaves = getSlaves(groupNumber, ownerNumber);
        let slave = slaves[random(0, slaves.length)];
        sendGroupMessage(groupNumber, `${At(ownerNumber)}\n你随机指派你的纵火犯${At(slave)}烧滨海写字楼`);
        updateCooldown(groupNumber, ownerNumber);
        setTimeout(() => {
            let burnResult = random(0, 100) < 60 ? false : true;
            if (!burnResult) {
                sendGroupMessage(groupNumber, `${At(ownerNumber)}\n你的纵火犯${At(slave)}在准备烧滨海写字楼的准备过程中被松山派出所的片警抓住了，他现在不再属于你`);
                detachSlaveToOwner(groupNumber, ownerNumber, slave);
            } else {
                let money = random(100, 501);
                giveMoney(groupNumber, ownerNumber, money);
                giveValue(groupNumber, slave, 100);
                sendGroupMessage(groupNumber, `${At(ownerNumber)}\n你的纵火犯${At(slave)}成功烧毁滨海写字楼，并拿走前台的${money}刀乐\n当前余额：${getMoney(groupNumber, ownerNumber)}刀乐\n当前纵火犯身价：${getValue(groupNumber, slave)}刀乐`);
            }
        }, 5000);
    } else {
        sendGroupMessage(groupNumber, "进行一次行动后有1分钟的藏身时间，避免被关进松山派出所");
    }
}

function stickPoster(groupNumber, ownerNumber) {
    initSlaveSystem(groupNumber, ownerNumber);
    if (isSlave(groupNumber, ownerNumber)) {
        sendGroupMessage(groupNumber, "你现在是其他人的纵火犯，你不能主动贴海报");
        return;
    }
    if (getSlaveAmount(groupNumber, ownerNumber) == 0) {
        sendGroupMessage(groupNumber, "你目前没有纵火犯，无法贴海报");
        return;
    }
    if(getMoney(groupNumber, ownerNumber) < 250){
        sendGroupMessage(groupNumber, "你没有250刀乐可以打印海报让纵火犯去贴");
        return;
    }
    if (checkCooldownOver(groupNumber, ownerNumber)) {
        let slaves = getSlaves(groupNumber, ownerNumber);
        let slave = slaves[random(0, slaves.length)];
        giveMoney(groupNumber, ownerNumber, -250);
        sendGroupMessage(groupNumber, `${At(ownerNumber)}\n你随机指派你的纵火犯${At(slave)}在罗源大街贴海报\n当前余额：${getMoney(groupNumber, ownerNumber)}刀乐`);
        updateCooldown(groupNumber, ownerNumber);
        setTimeout(() => {
            let stickResult = random(0, 100) > 500 ? false : true;
            if (!stickResult) {
                sendGroupMessage(groupNumber, `${At(ownerNumber)}\n你的纵火犯${At(slave)}在罗源大街贴海报被罗源城关派出所的片警抓住了，他现在不再属于你`);
                detachSlaveToOwner(groupNumber, ownerNumber, slave);
            } else {
                let owners = getOwners(groupNumber, ownerNumber);
                if(owners.length <= 0){
                    sendGroupMessage(groupNumber, "目前只有你拥有纵火犯，贴海报貌似没有什么效果");
                    return;
                }
                let owner = owners[random(0, owners.length)];
                let ownerSlaves = getSlaves(groupNumber, owner);
                //挑选随机数量的目标奴隶
                let transAmount = random(1, ownerSlaves.length);
                let shuffled = ownerSlaves.slice(0), i = ownerSlaves.length, min = i - transAmount, temp, index;
                while (i-- > min) {
                    index = Math.floor((i + 1) * Math.random());
                    temp = shuffled[index];
                    shuffled[index] = shuffled[i];
                    shuffled[i] = temp;
                }
                let transSlaves = shuffled.slice(min);
                let message = `${At(ownerNumber)}\n你的纵火犯${At(slave)}在罗源大街贴满了海报，${At(owner)}的${transAmount}位纵火犯选择成为你的纵火犯，他们分别是：\n`;
                for (let j = 0; j < transSlaves.length; j++) {
                    message += `${At(transSlaves[j])}\n`;
                    detachSlaveToOwner(groupNumber, owner, transSlaves[j]);
                    attachSlaveToOwner(groupNumber, ownerNumber, transSlaves[j]);
                }
                giveValue(groupNumber, slave, 100);
                message += `当前纵火犯身价：${getValue(groupNumber, slave)}刀乐`
                sendGroupMessage(groupNumber, message);
            }
        }, 5000);
    } else {
        sendGroupMessage(groupNumber, "进行一次行动后有五分钟的藏身时间，避免被关进松山派出所");
    }
}

module.exports = {
    catchSlave,
    releaseSlave,
    burnBuilding,
    stickPoster
}