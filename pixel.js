(function() {
    const events = {
        AddToCart: () => handleEvent("AddToCart"),
        Purchase: () => handleEvent("Purchase"),
        ViewContent: () => handleEvent("ViewContent")
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

        // 添加滚动和页面活动监听器
        document.addEventListener('scroll', handleViewContent);
        document.addEventListener('mousemove', handleViewContent);
        document.addEventListener('keydown', handleViewContent);

        document.addEventListener('DOMContentLoaded', function() {
            // 添加点击 .yuri-cta 元素的监听器
            document.querySelectorAll('.yuri-cta').forEach(function(element) {
                element.addEventListener('click', handleAddToCartClick);
            });
        });
    };

    const handleEvent = (event, value) => {
        console.log(event);

        if (event === "init") {
            setCookie("__api", value);
        } else {
            const requestId = getCookie("__rid");
            sendEvent({ requestId, event, value });
        }
    };

    const handleViewContent = () => {
        document.removeEventListener('scroll', handleViewContent);
        document.removeEventListener('mousemove', handleViewContent);
        document.removeEventListener('keydown', handleViewContent);
        handleEvent("ViewContent");
    };

    const handleAddToCartClick = (event) => {
        handleEvent("AddToCart");
    };

    const sendEvent = (eventData) => {
        const apiCookie = getCookie("__api");
        const url = decrypt(atob(apiCookie), "yuri");

        const data = new FormData();
        data.append('_ajax', btoa(decrypt(JSON.stringify(eventData), "yuri")));

        if (!navigator.sendBeacon(url, data)) {
            console.error('Beacon send failed');
        }
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

    const decrypt = (data, key) => {
        return [...data].map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ key[index % key.length].charCodeAt(0))).join('');
    };

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
