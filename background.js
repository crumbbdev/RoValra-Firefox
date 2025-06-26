// Dont look at this shit dookie poo po of code
// Actually you can look at it. i removed the bad parts / useless


//Felt like adding a random comment here cuz im very stable ROREGION STILL SUCKS ASSSSS

// I agree, roregion is terrible <3






// Starting roblox logic, i would recommend not touching this :)
const ext = (typeof browser !== "undefined") ? browser : chrome;

ext.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "injectScript") {
        const { codeToInject } = message;
        if (ext.scripting && ext.scripting.executeScript) {
            ext.scripting.executeScript({
                target: { tabId: sender.tab.id },
                func: (code) => {
                    try {
                        const script = document.createElement('script');
                        script.textContent = code;
                        document.documentElement.appendChild(script);
                        script.remove();
                    } catch (error) { }
                },
                args: [codeToInject],
            })
                .then(() => {
                    sendResponse({ success: true });
                })
                .catch((error) => {
                    sendResponse({ success: false, error: error.message });
                });
        } else if (ext.tabs && ext.tabs.executeScript) {
            ext.tabs.executeScript(sender.tab.id, {
                code: codeToInject,
                runAt: "document_start"
            }, () => {
                if (ext.runtime.lastError) {
                    sendResponse({ success: false, error: ext.runtime.lastError.message });
                } else {
                    sendResponse({ success: true });
                }
            });
        } else {
            sendResponse({ success: false, error: "No supported script injection API." });
        }
        return true;
    }
    return false;
});
ext.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    switch (message.action) {
        case 'enableServerJoinHeaders':
            ext.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ['ruleset_2'],
            });
            break;
        case 'disableServerJoinHeaders':
            ext.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ['ruleset_2'],
            });
            break;
        case 'enableUserSniper':
            ext.declarativeNetRequest.updateEnabledRulesets({
                enableRulesetIds: ['ruleset_1'],
            });
            break;
        case 'disableUserSniper':
            ext.declarativeNetRequest.updateEnabledRulesets({
                disableRulesetIds: ['ruleset_1'],
            });
            break;
        case "fetchItemData":
            fetch("")
                .then((response) => response.json())
                .then((data) => {
                    sendResponse({
                        success: true,
                        data: data
                    });
                })
                .catch((error) => {
                    sendResponse({
                        success: false,
                        message: error.message
                    });
                });
            return true;
        default:
            return;
    }
    return;
});

const currentVersion = ext.runtime.getManifest().version;
const repoOwner = "";
const repoName = "";
const githubApiUrl = ``;
let isDebugMode = false;
async function fetchLatestRelease() {
    try {
        const response = await fetch(githubApiUrl);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return data.tag_name.startsWith('v') ? data.tag_name.substring(1) : data.tag_name;
    } catch (error) {
        return null;
    }
}

async function applyUpdate() {
    const latestVersion = await fetchLatestRelease();
    if (latestVersion && compareVersions(latestVersion, currentVersion) > 0) {
        ext.tabs.create({
            url: ``
        });
    } else {
    }
}
function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p2 > p1) return -1;
    }
    return 0;
}

async function checkForUpdates(bypassDoNotShow = false) {
    const latestVersion = await fetchLatestRelease();
    ext.storage.local.get(['doNotShowAgain', 'dismissedVersion'], (result) => {
        if (result.doNotShowAgain === true && result.dismissedVersion === latestVersion && !bypassDoNotShow) {
            return;
        }
        if (result.dismissedVersion !== latestVersion)
            ext.storage.local.remove(['doNotShowAgain', 'dismissedVersion']);
        if (latestVersion) {
            if (isDebugMode || compareVersions(latestVersion, currentVersion) > 0 || bypassDoNotShow) {
                applyUpdate();
            } else {
            }
        }
    });
}
ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkUpdatesDebug") {
        isDebugMode = true;
        checkForUpdates();
    } else if (request.action === "fetchHiddenGames") {
        ext.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            ext.tabs.sendMessage(tabs[0].id, request, function (response) {
                sendResponse(response);
            });
        });
        return true;
    }
    else if (request.action === 'resetDoNotShow') {
        ext.storage.local.remove('doNotShowAgain');
        sendResponse({
            message: 'do not show reset'
        });
        return true;
    } else if (request.action === "applyUpdate") {
        applyUpdate();
    } else if (request.action === 'showUpdateOverlayFromPopup') {
        checkForUpdates(true);
        sendResponse({
            message: 'showing update overlay from popup'
        });
        return true;
    } else if (request.action === 'setDoNotShowAgain') {
        const latestVersion = request.latestVersion;
        ext.storage.local.set({
            doNotShowAgain: true,
            dismissedVersion: latestVersion
        });
        sendResponse({
            message: 'do not show set'
        });
        return true;
    }
    return false;
});

ext.runtime.onInstalled.addListener(() => {
    if (isDebugMode) {
        ext.storage.local.remove('doNotShowAgain');
    }
    checkForUpdates();
});
ext.runtime.onStartup.addListener(() => {
    checkForUpdates();
});
ext.action.onClicked.addListener(() => {
    checkForUpdates(true);
});

ext.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('roblox.com')) {
        checkForUpdates();
    }
});

ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchHiddenGames") {
        const userId = message.userId;
        const apiUrl = `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=10&sortOrder=Asc`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const hiddenGames = data.data.filter(game => {
                    return !document.querySelector(`[data-game-id="${game.id}"]`);
                });
                const newTabHtml = hiddenGames.map(game => `
                    <div>
                        <h3>${game.name}</h3>
                        <a href="https://www.roblox.com/games/${game.id}" target="_blank">
                            ${game.name}
                        </a>
                    </div>
                `).join("");
                const newTabContent = `
                    <html>
                    <head>
                        <title>Hidden Games</title>
                    </head>
                    <body>
                        <h1>Hidden Games for User ${userId}</h1>
                        ${newTabHtml || "<p>No hidden games found.</p>"}
                    </body>
                    </html>
                `;
                const blob = new Blob([newTabContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                ext.tabs.create({ url });
            })
            .catch(error => console.error('Error fetching hidden games:', error));
    }
  });

