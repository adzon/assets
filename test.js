(function() {
    const events = {
        AddToCart: () => handleEvent("AddToCart"),
        Purchase: () => handleEvent("Purchase")
    };

    const init = () => {
        const currentUrl = window.location.href;
        const urlEvents = {
            "checkout": "AddToCart",
            "register=true": "AddToCart",
            "c.php?product_id": "AddToCart",
            "orders": "Purchase",
            "&a=pay&order_no": "Purchase",
            "order_info.html": "Purchase",
            "order-received": "Purchase",
            "deposit=success": "Purchase"
        };

        Object.entries(urlEvents).forEach(([urlPart, event]) => {
            if (currentUrl.includes(urlPart)) {
                handleEvent(event);
            }
        });
    };

    const handleEvent = (event, value) => {
        console.log(event);

        if (event === "init") {
            setCookie("__api", value);
        } else {
            const requestId = getCookie("__rid");
            sendEvent({ requestId, event, value }, sendPixel, noop);
        }
    };

    const sendPixel = (data) => {
        if (data.pixel) {
            createPixelImage(data);
        }
    };

    const createPixelImage = (data) => {
        const img = document.createElement("img");
        img.style.display = "none";
        img.height = 1;
        img.width = 1;
        img.src = `https://www.facebook.com/tr?id=${data.pixel}&ev=${data.event}&cd[value]=${data.value}&cd[currency]=USD&noscript=1`;
        document.body.appendChild(img);
    };

    const setCookie = (name, value, days = 30) => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    };

    const getCookie = (name) => {
        const cookieString = document.cookie.split("; ").find(row => row.startsWith(`${name}=`));
        return cookieString ? cookieString.split('=')[1] : null;
    };

    const getQueryParam = (param) => {
        return new URLSearchParams(window.location.search).get(param) || "";
    };

    const sendEvent = (eventData, onSuccess, onError) => {
        const xhr = new XMLHttpRequest();
        const apiCookie = getCookie("__api");
        const url = decrypt(atob(apiCookie), "yuri");

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("X-Requested-By", "Yuri");
        xhr.withCredentials = true;

        xhr.onload = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                response.status === "success" ? onSuccess(response) : onError();
            }
        };

        xhr.send(`_ajax=${btoa(decrypt(JSON.stringify(eventData), "yuri"))}`);
    };

    const decrypt = (data, key) => {
        return [...data].map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ key[index % key.length].charCodeAt(0))).join('');
    };

    const noop = () => {};

    (() => {
        const scriptSrc = (document.currentScript || {}).src || "";
        const urlParams = new URLSearchParams(scriptSrc.split("?")[1]);

        const rid = getCookie("__rid") || getQueryParam("_rid") || urlParams.get("_rid") || "";

        if (rid && rid.length == 32) {
            setCookie("__rid", rid);
            handleEvent("init", "EQEGGQpPXUYaHRMdVwYaCAsQHxBXERMQVhQCAFYMBxsQKgIAARAe");
            handleEvent("PageView");
            init();
        }
    })();

    window._yuri_track = window._yuri_track || function(event) {
        events[event] && events[event]();
    };

    if (window._yuri_track.queue) {
        window._yuri_track.queue.forEach(([event]) => {
            events[event] && events[event]();
        });
        window._yuri_track.queue = [];
    }
})();
