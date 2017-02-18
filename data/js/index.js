const notifications = require("sdk/notifications");
const {Cc, Ci} = require('chrome');
var tabs = require("sdk/tabs");
var md5 = require("./md5.js");
var ss = require("sdk/simple-storage");

var data;
var dataHash;
var storageData = ss.storage.data;

if (storageData == undefined) {
    dataHash = generateNewFingerPrint();
    notifyUser("New canvas noise hash #" + dataHash);
} else {
    data = JSON.parse(storageData);
    dataHash = md5(storageData);
    notifyUser("Current canvas noise hash #" + dataHash);
    //console.log("r" + data.r + "g" + data.g + "b" + data.b + "a" + data.a);
}

var pageMod;

var docId = getRandomString();
function inject() {
    pageMod = require("sdk/page-mod").PageMod({
        include: "*",
        contentScriptFile: "./js/content.js",
        contentScriptWhen: "start",
        contentScriptOptions: {
            r: data.r,
            g: data.g,
            b: data.b,
            a: data.a,
            docId: docId
        }
    });
}

inject();

var button = require("sdk/ui").ToggleButton({
    id: "generate-canvas-noise",
    label: "Create & use new canvas fingerprint",
    icon: {
        "16": "./img/16x16.png",
        "32": "./img/48x48.png",
        "64": "./img/128x128.png"
    },
    onChange: handleChange
});

var panel = require("sdk/panel").Panel({
    contentURL: "./html/panel.html",
    contentScriptFile: [
        "./js/panel.js"
    ],
    onHide: handleHide
});
panel.port.emit("panel-data-hash", dataHash);

function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button
        });
    }
}

function handleHide() {
    button.state('window', {checked: false});
}

panel.port.on("generate-fingerprint", function () {
    panel.hide();
    generateAndInject();
});

panel.port.on("open-info", function () {
    panel.hide();
    tabs.open("https://multiloginapp.com?utm_source=canvasdefender-ff");
});

function generateAndInject() {
    dataHash = generateNewFingerPrint();
    pageMod.destroy();
    inject();

    panel.port.emit("panel-data-hash", dataHash);

    notifyUser("New canvas noise hash #" + dataHash);
};

function generateNewFingerPrint() {
    data = {};
    data.r = 10 - randomIntFromInterval(0, 20);
    data.g = 10 - randomIntFromInterval(0, 20);
    data.b = 10 - randomIntFromInterval(0, 20);
    data.a = 10 - randomIntFromInterval(0, 20);
    var strData = JSON.stringify(data);
    ss.storage.data = strData;
    // console.log("r" + data.r + "g" + data.g + "b" + data.b + "a" + data.a);
    return md5(strData).substring(0, 10);
}

function notifyUser(message) {
    notifications.notify({
        title: "Canvas Defender is active",
        text: message,
        iconURL: "./img/64x64.png",
        onClick: function (data) {
        }
    });
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomString() {
    var text = "";
    var charset = "abcdefghijklmnopqrstuvwxyz";
    for (var i = 0; i < 5; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}

