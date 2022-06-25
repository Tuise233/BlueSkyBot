const fs = require("fs");
const { resolve } = require("path");
const wordPath = `${resolve("./")}\\assets\\words.json`;

function getWordsKey() {
    let keywords = [];
    let words = JSON.parse(fs.readFileSync(wordPath));
    Object.keys(words["words"]).forEach((key) => {
        keywords.push(key);
    });
    return keywords;
}

function getWordsValue(key) {
    let words = JSON.parse(fs.readFileSync(wordPath));
    if (words["words"][key] == undefined) return [];
    let wordArray = [];
    for (let i = 0; i < String(words["words"][key]).split("|").length; i++) {
        wordArray.push(String(words["words"][key]).split("|")[i]);
    }
    return wordArray;
}

function addWord(key, value) {
    let words = JSON.parse(fs.readFileSync(wordPath));
    if (words["words"][key] != undefined) {
        words["words"][key] = words["words"][key] + "|" + value;
    } else {
        words["words"][key] = value;
    }
    let writeData = JSON.stringify(words, null, "\t");
    fs.writeFileSync(wordPath, writeData);
}

function deleteWord(key) {
    let words = JSON.parse(fs.readFileSync(wordPath));
    if (words["words"][key] == undefined) return false;
    delete words["words"][key];
    let writeData = JSON.stringify(words, null, "\t");
    fs.writeFileSync(wordPath, writeData);
    return true;
}

module.exports = {
    getWordsKey,
    getWordsValue,
    addWord,
    deleteWord
}