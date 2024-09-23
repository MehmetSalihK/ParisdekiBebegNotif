// Eski tarayıcılar için
if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {
        }

        F.prototype = obj;
        return new F();
    };
}

(function ($, window, document, undefined) {
    const Youtube = {
        API_CHANNEL_URL: "https://www.googleapis.com/youtube/v3/channels",
        API_VIDEOS_URL: "https://www.googleapis.com/youtube/v3/playlistItems",

        /**
         * Eklentiyi başlatır.
         * @param {object} options
         * @param {jQuery Object} elem
         */
        initialize: function (options, elem) {
            this.elem = elem;
            this.$elem = $(elem);
            (this.key = $.fn.Youtube.accessData.key),
                (this.channelId = $.fn.Youtube.accessData.channelId),
                (this.options = $.extend({}, $.fn.Youtube.options, options));

            this.messages = {
                defaultImageAltText: "Youtube videosu",
                notFound: "Kanal bulunamadı veya içerik bulunamadı.",
            };

            this.getChannelInfos();
        },

        /**
         * Fetch fonksiyonunu çağırır ve yanıtla çalışır.
         */
        getChannelInfos: function () {
            const self = this;

            self.fetchChannel().done(function (results) {
                if (results.items) {
                    $.each(results.items, function (i, item) {
                        let pid = item.contentDetails.relatedPlaylists.uploads;
                        self.getVideos(pid);
                    });
                } else {
                    $.error("Youtube - Hata: Hiçbir kanal bulunamadı.");
                }
            });
        },

        getVideos: function (pid) {
            const self = this;

            self.fetchVideos(pid).done(function (results) {
                if (results.items) {
                    self.displayVideos(results.items)
                } else {
                    $.error("Youtube - Hata: Hiçbir video bulunamadı.");
                }
            });
        },

        /**
         * Ajax çağrısını yapar ve sonucu döndürür.
         */
        fetchChannel: function () {
            const getUrl =
                this.API_CHANNEL_URL + "?key=" + this.key + "&id=" + this.channelId + "&part=contentDetails";

            return $.ajax({
                type: "GET",
                dataType: "json",
                cache: false,
                url: getUrl,
            });
        },

        /**
         * Ajax çağrısını yapar ve sonucu döndürür.
         */
        fetchVideos: function (pid) {
            const getUrl =
                this.API_VIDEOS_URL + "?key=" + this.key + "&maxResults=" + this.options.max + "&playlistId=" + pid + "&part=snippet";

            return $.ajax({
                type: "GET",
                dataType: "json",
                cache: false,
                url: getUrl,
            });
        },

        /**
         * Markup'ı DOM'a videolarla ekler.
         * @param {object} results
         */
        displayVideos: function (results) {
            let $element,
                hasCaption,
                videoGroup = [],
                videoCaption,
                videoDiv = [],
                max;

            max =
                this.options.max >= results.length
                    ? results.length
                    : this.options.max;

            if (results.length === 0) {
                this.$elem.append(this.messages.notFound);
                return;
            }

            for (let i = 0; i < max; i++) {
                videoGroup = [];

                hasCaption =
                    results[i].snippet.title !== null;

                videoCaption =
                    ($("<p>").text(
                        hasCaption
                        ? results[i].snippet.title
                        : this.messages.defaultImageAltText
                    ));

                $element = $("<a>", {
                    href: "https://www.youtube.com/watch?v=" + results[i].snippet.resourceId.videoId,
                    style:
                        "background:url(" +
                        results[i].snippet.thumbnails.default.url +
                        ") no-repeat center / cover;",
                    rel: "nofollow",
                });

                // Öğeyi ekle
                videoGroup.push($element.append($("<span>").append(videoCaption)));
                videoDiv.push(($("<div>").append(videoGroup)));
            }

            this.$elem.append(videoDiv);

            if (typeof this.options.complete === "function") {
                this.options.complete.call(this);
            }
        },
    };

    /**
     * FCYoutube Eklentisi Tanımı.
     */
    jQuery.fn.Youtube = function (options) {
        if (jQuery.fn.Youtube.accessData.key) {
            this.each(function () {
                const youtube = Object.create(Youtube);
                youtube.initialize(options, this);
            });
        } else {
            $.error("Veri almak için bir API anahtarı gereklidir.");
        }
    };

    // Eklenti Varsayılan Seçenekleri.
    jQuery.fn.Youtube.options = {
        complete: null,
        max: 3,
    };

    // Youtube Erişim Verileri.
    jQuery.fn.Youtube.accessData = {
        accessToken: null,
        channelId: null,
    };
})(jQuery, window, document);

jQuery.fn.Youtube.accessData = {
    key: config.youtube.key,
    channelId: config.youtube.channelId
};

$('#youtube-feed').Youtube({
    max: 3, // Gösterilecek fotoğraf sayısı (1 ile 25 arasında). Varsayılan: 9
    complete: function () { // Videolar görüntülendikten sonra çalıştırılacak bir geri çağırma fonksiyonu.
        console.log('Youtube tamamlandı');
    }
});
