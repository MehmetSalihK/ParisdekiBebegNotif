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
    const Instagram = {
        API_URL: "https://graph.instagram.com/me/media?fields=",
        API_FIELDS: "caption,media_url,media_type,permalink,timestamp,username",

        /**
         * Eklentiyi başlatır.
         * @param {object} options
         * @param {jQuery Object} elem
         */
        initialize: function (options, elem) {
            this.elem = elem;
            this.$elem = $(elem);
            (this.accessToken = $.fn.Instagram.accessData.accessToken),
                (this.options = $.extend({}, $.fn.Instagram.options, options));

            this.messages = {
                defaultImageAltText: "Resme erişmek için tıklayın.",
                notFound: "Bu Instagram kullanıcısı mevcut değil veya hesabını özel yapmış.",
            };

            this.getPhotos();
        },

        /**
         * Fetch fonksiyonunu çağırır ve yanıtla çalışır.
         */
        getPhotos: function () {
            const self = this;

            self.fetch().done(function (results) {
                if (results.data) {
                    self.displayPhotos(results);
                } else if (results.error.message) {
                    $.error("Instagram - Hata: " + results.error.message);
                } else {
                    $.error("Instagram - Hata: Hesapta fotoğraf yok.");
                }
            });
        },

        /**
         * Ajax çağrısını yapar ve sonucu döndürür.
         */
        fetch: function () {
            const getUrl =
                this.API_URL + this.API_FIELDS + "&access_token=" + this.accessToken;

            return $.ajax({
                type: "GET",
                dataType: "json",
                cache: false,
                url: getUrl,
            });
        },

        /**
         * Markup'ı DOM'a resimlerle ekler.
         * @param {object} results
         */
        displayPhotos: function (results) {
            let $element,
                $video,
                hasCaption,
                imageGroup = [],
                postDiv = [],
                imageCaption,
                autoplay,
                max;

            max =
                this.options.max >= results.data.length
                    ? results.data.length
                    : this.options.max;

            if (results.data.length === 0) {
                this.$elem.append(this.messages.notFound);
                return;
            }

            for (let i = 0; i < max; i++) {
                imageGroup = [];

                if (
                    results.data[i].media_type === "IMAGE" ||
                    results.data[i].media_type === "CAROUSEL_ALBUM"
                ) {
                    hasCaption =
                        results.data[i].caption !== undefined;

                    imageCaption =
                        ($("<p>").text(hasCaption
                            ? results.data[i].caption
                            : this.messages.defaultImageAltText
                        ));

                    $element = $("<a>", {
                        href: results.data[i].permalink,
                        style:
                            "background:url(" +
                            results.data[i].media_url +
                            ") no-repeat center / cover;",
                        rel: "nofollow",
                    });

                    // Öğeyi ekle
                    imageGroup.push($element.append($("<span>").append(imageCaption)));
                    postDiv.push(($("<div>").append(imageGroup)));

                } else if (results.data[i].media_type === "VIDEO") {
                    hasCaption =
                      results.data[i].caption !== undefined;

                    autoplay =
                        this.options.autoplay === true
                            ? "autoplay muted loop playsinline"
                            : "";

                    imageCaption =
                      ($("<p>").text(hasCaption
                        ? results.data[i].caption
                        : this.messages.defaultImageAltText
                      ));

                    $source = $("<source>", {
                        src: results.data[i].media_url,
                        type: "video/mp4",
                    });

                    $video = $("<video " + autoplay + ">").append($source);

                    $element = $("<a>", {
                        href: results.data[i].permalink,
                        target: "_blank",
                        rel: "nofollow",
                    }).append($video);

                    // Öğeyi ekle
                    imageGroup.push($element.append($("<span>").append(imageCaption)));
                    postDiv.push(($("<div>").append(imageGroup)));
                }
            }

            this.$elem.append(postDiv);

            if (typeof this.options.complete === "function") {
                this.options.complete.call(this);
            }
        },
    };

    /**
     * FCInstagram Eklentisi Tanımı.
     */
    jQuery.fn.Instagram = function (options) {
        if (jQuery.fn.Instagram.accessData.accessToken) {
            this.each(function () {
                let instagram = Object.create(Instagram);
                instagram.initialize(options, this);
            });
        } else {
            $.error("Instagram - hata: Geçersiz token.");
        }
    };

    // Eklenti Varsayılan Seçenekleri.
    jQuery.fn.Instagram.options = {
        complete: null,
        max: 4,
        autoplay: false
    };

    // Instagram Erişim Verileri.
    jQuery.fn.Instagram.accessData = {
        accessToken: null,
    };
})(jQuery, window, document);

jQuery.fn.Instagram.accessData = {
    accessToken: config.instagram.accessToken, // Token
};

$('#instagram-feed').Instagram({
    max: 4, // Gösterilecek fotoğraf sayısı (1 ile 25 arasında). Varsayılan: 9
    autoplay: true, // Video otomatik oynatma: true/false. Varsayılan: false
    complete: function () { // Fotoğraflar görüntülendikten sonra çalıştırılacak bir geri çağırma fonksiyonu.
        console.log('Instagram tamamlandı');
    }
});
