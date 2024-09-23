// Kick akış verilerini alacak fonksiyonu tanımlayın
async function getKickStreamData() {
    const apiUrl = `https://kick.com/api/v2/channels/${config.kick.channel_name}/`; // config.js'den kanal adını kullanma
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) { // Cevabın uygun olup olmadığını kontrol et
            throw new Error(`HTTP Hatası: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Kick verilerini alırken hata oluştu:', error);
        return null;
    }
}

// Akış durumunu kontrol etme fonksiyonu
async function check() {
    try {
        const kickData = await getKickStreamData();

        // Eğer akış canlıysa, simgeyi ve başlığı güncelle
        if (kickData && kickData.livestream && kickData.livestream.is_live) {
            setBrowserActionIconAndTitle(true);  // Akış canlı
        } else {
            setBrowserActionIconAndTitle(false); // Akış çevrimdışı
        }

        // Gerekirse app fonksiyonunu çağır
        app();
    } catch (error) {
        console.error('Akışı kontrol ederken hata oluştu:', error);
    }
}

// Uzantının düğmesinin simgesini ve başlığını güncelleme fonksiyonu
function setBrowserActionIconAndTitle(isLive) {
    const title = isLive ? `Paris'deki Bebeğ - CANLI YAYINDA` : `Paris'deki Bebeğ - ÇEVRİMDIŞI`;

    // Dinamik olarak simgeyi değiştirmek için chrome.action.setIcon kullanın
    chrome.action.setIcon({ path: { 64: isLive ? "images/icon_on_64.png" : "images/icon_off_64.png" } });
    chrome.action.setTitle({ title });
}

// Uzantı başlatıldığında check fonksiyonunun ilk çağrısı
check();

// Her 15 saniyede bir check fonksiyonunu periyodik olarak çağır
setInterval(check, 15000);
