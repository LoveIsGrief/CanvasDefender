const storageSet = chrome.storage.local.set;
const storageGet = chrome.storage.local.get;
const timerMap = {
    "-1": "Never",
    "1": "Every minute",
    "5": "Every 5 minutes",
    "15": "Every 15 minutes",
    "30": "Every 30 minutes",
    "60": "Every hour",
    "180": "Every 3 hours",
    "360": "Every 6 hours",
    "1440": "Every 24 hours",
    "10080": "Every week",
};
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

storageGet(["enabled", "timer", "latestUpdate"], (elems = {})=>{
    let {enabled = true, timer = -1, latestUpdate = 0} = elems;
    setTimerInfo(timer, latestUpdate);
    chrome.runtime.sendMessage({action: "panel-data-hash"}, function (data) {
        console.log(data);
        const {dataHash, latestUpdate} = data;
        const dataHashElem = document.getElementById('data_hash');
        dataHashElem.textContent = dataHash;
        setTimerInfo(timer, latestUpdate);
    });
    const disable = document.getElementById('disable');
    const generateFingerprint = document.getElementById('generate_fingerprint');
    generateFingerprint.addEventListener('click', function () {
        if (!enabled) {
            enabled = !enabled;
            storageSet({enabled}, ()=>{
                active(enabled, disable, true);
                chrome.runtime.sendMessage({action: "generate-fingerprint"});
                window.close();
            });
        } else {
            chrome.runtime.sendMessage({action: "generate-fingerprint"});
            window.close();
        }
    });
    const infoUrl = document.getElementById('info_url');
    infoUrl.addEventListener('click', function () {
        chrome.runtime.sendMessage({action: "open-info"});
        window.close();
    }, false);
    const optionUrl = document.getElementById('option_url');
    optionUrl.addEventListener('click', function () {
        chrome.runtime.sendMessage({action: "open-options"});
        window.close();
    }, false);
    
    disable.addEventListener('click', function () {
        enabled = !enabled;
        storageSet({enabled}, ()=>{
            active(enabled, disable, true);
        });
    }, false);
    active(enabled, disable);
});

function setTimerInfo(timer, latestUpdate) {
    const date = latestUpdate? new Date(latestUpdate): new Date();
    window.latest_changed.textContent = ` ${getDateFormat(date)} ${getTimeFormat(date)}`;
    if (timer > 0) {
        window.schedule_wrap.style.display = "inline";
        const nextDate = new Date(date.getTime() + timer * 60 * 1000);
        window.schedule.textContent = ` ${getDateFormat(nextDate)} ${getTimeFormat(nextDate)}`;
    } else {
        window.schedule_wrap.style.display = "none";
    }
}

function getDateFormat(date) {
    return `${monthNames[date.getMonth()]} ${date.getDate()}`
}

function getTimeFormat(date) {
    return `${add0ToNumber(date.getHours())}:${add0ToNumber(date.getMinutes())}`;
}

function add0ToNumber(number) {
    return `${number < 10? "0" + number: number}`;
}

function active(enabled, disable, resetIcon) {
    const inactive = document.getElementById('inactive');
    const active = document.getElementById('active');
    if (enabled){
        active.style.display = "block";
        inactive.style.display = "none";
        disable.textContent = "Stop Adding Noise"
    } else {
        active.style.display = "none";
        inactive.style.display = "block";
        disable.textContent = "Start Adding Noise";
    }
    if (resetIcon) {
        setIcon(enabled);
    }
}

function setIcon(enabled){
    const path = chrome.extension.getURL(`/img/16x16${enabled? "" : "_inactive"}.png`);
    chrome.browserAction.setIcon({path})
}
