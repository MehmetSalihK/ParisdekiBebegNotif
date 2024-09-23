$('body').on('click', 'a', function () {
    chrome.tabs.create({ url: $(this).attr('href') });
});

async function app() {
    // Kick bilgilerini alma
    const kickData = await getKickStreamData(); // config üzerinden Kick API kullanımı
    
    // Kick linkini güncelle
    $('.stream').attr('href', `https://kick.com/${config.kick.channel_name}`);

    // Sosyal medya yönetimi
    $('.buttons').html("");
    for (let [key, value] of Object.entries(config.social)) {
        if (value) {
            $('.buttons').append(`<a href="${value}" id="${key}"><img src="images/${key}.png" alt="${key}"></a>`);
        }
    }

    // Canlı Kick yönetimi
    if (kickData && kickData.livestream && kickData.livestream.is_live) {
        // Passer en mode EN LIVE pour Kick
        $('.offline').addClass('disabled');
        $('.online').removeClass('disabled');

        // Kick bilgilerini alma
        const kickViewersCount = kickData.livestream.viewer_count ? kickData.livestream.viewer_count.toLocaleString('tr') : 0;
        const kickThumbnailUrl = kickData.livestream.thumbnail.url || 'images/placeholder.png';

        // Kick için bilgileri güncelle
        $('.online #viewers').html('<img src="images/eye.png" alt="Göz ikonu"> ' + kickViewersCount + ' izleyici' + (kickViewersCount < 2 ? '' : 'ler'));
        $('.online #stream-title').html(kickData.livestream.session_title);
        $('.online #thumbnail')[0].style.background = "url(" + kickThumbnailUrl + ") no-repeat center / cover";

    } else {
        // HORS-LİNE moda geç
        $('.online').addClass('disabled');
        $('.offline').removeClass('disabled');
    }

    // Uygulama görünümünü yüklendikten sonra göster
    $('.loading').addClass('disabled');
    $('.app').removeClass('disabled');
}

// Kick livestream verilerini API'den alma fonksiyonu
async function getKickStreamData() {
    const apiUrl = `https://kick.com/api/v2/channels/${config.kick.channel_name}/`; // config.js'den kanal adı kullanımı
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) { // Cevabın iyi olup olmadığını kontrol et
            throw new Error(`HTTP Hatası: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Kick verileri alınırken hata oluştu:', error);
        return null;
    }
}

// İlk app fonksiyonu çağrısı
app();

async function getStreamData() {
    try {
        const response = await fetch(`https://kick.com/api/v2/channels/${config.kick.channel_name}/`, {
            method: 'GET'
        });

        const data = await response.json();
        if (data && data.livestream && data.livestream.is_live) {
            const isNotified = await getNotifiedStatus();
            if (!isNotified) {
                showNotification(data.livestream, data.user); // Yayın ve kullanıcı verilerini geçir
                setNotifiedStatus(true); // Bildirim olarak işaretle
            }
            return data.livestream;
        } else {
            setNotifiedStatus(false); // Yayıncı canlı değilse sıfırla
        }
        return null; 
    } catch (error) {
        console.error('getStreamData isteği sırasında hata oluştu:', error);
        return null;
    }
}

function showNotification(livestream, user) {
    const username = user.username;
    const profilePic = user.profile_pic; // Profil resminin URL'sini al

    chrome.notifications.create({
        type: 'basic',
        iconUrl: profilePic, // Profil resmini simge olarak kullan
        title: `${username} CANLI YAYINDA!`,
        message: `KAHVENİ AL VE YAYINI GEL! ☕️`, // Biyo veya diğer bilgileri ekle
        priority: 2
    }, () => {
        const audio = new Audio(chrome.runtime.getURL('images/carsound.mp3'));
        audio.play();
    });
}

// chrome.storage kullanarak notification durumunu kaydet
function setNotifiedStatus(status) {
    chrome.storage.local.set({ notified: status });
}

// Notification durumunu almak
function getNotifiedStatus() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['notified'], (result) => {
            resolve(result.notified || false);
        });
    });
}

// Her 5 dakikada bir kontrol et (300000 ms)
setInterval(getStreamData, 3000);
