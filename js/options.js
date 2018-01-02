const storageSet = chrome.storage.local.set;
const storageGet = chrome.storage.local.get;

storageGet(["whitelist", "timer"], (elems = {})=>{
  const {whitelist = {}, timer = -1} = elems;
  window.whitelist.value = Object.keys(whitelist).join(",")
  window.timer.value = timer;
  window.save.addEventListener("click", ()=>{
    const newWhitelist = {};
    window.whitelist.value.split(",").forEach(value=>newWhitelist[value.trim()]="");
    storageSet({
      "whitelist": newWhitelist,
      "timer": window.timer.value | 0
    });
  })
});