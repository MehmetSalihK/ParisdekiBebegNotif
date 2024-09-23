async function OAuth() {
    // Kick.com, kamuya açık bilgiler için OAuth kimlik doğrulaması gerektirmez
    return null; // Kamuya açık verileri almak için token gerekmiyor
}

async function streamIsOpen() {
    return new Promise(resolve => {
        chrome.windows.getAll({ populate: true }, windows => {
            for (const window of windows) {
                const tabs = window.tabs;
                for (const tab of tabs) {
                    if (tab.url.includes('kick.com/' + config.kick.channel_name)) {
                        resolve(true);
                        return;
                    }
                }
            }
            resolve(false);
        });
    });
}

async function getUserInfos() {
    try {
        const response = await fetch(`https://kick.com/api/v2/channels/${config.kick.channel_name}/`, {
            method: 'GET'
        });

        const data = await response.json();
        return data ? data : null; // Kullanıcı verilerini döndür
    } catch (error) {
        console.error('getUserInfos isteği sırasında hata oluştu:', error);
        return null;
    }
}

async function getStreamData() {
    try {
        const response = await fetch(`https://kick.com/api/v2/channels/${config.kick.channel_name}/`, {
            method: 'GET'
        });

        const data = await response.json();
        return data && data.livestream && data.livestream.is_live ? data.livestream : null; // Akış verilerini döndür
    } catch (error) {
        console.error('getStreamData isteği sırasında hata oluştu:', error);
        return null;
    }
}
