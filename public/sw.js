const CACHE_NAME =
    "store-manager-v1";

const STATIC_ASSETS = [

    "/",

    "/manifest.json",

    "/icon-192.png",

    "/icon-512.png",
];

self.addEventListener(
    "install",
    (event) => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then((cache) =>
                    cache.addAll(
                        STATIC_ASSETS
                    )
                )
        );

        self.skipWaiting();
    }
);

self.addEventListener(
    "activate",
    (event) => {

        event.waitUntil(

            caches
                .keys()
                .then((keys) =>

                    Promise.all(

                        keys.map(
                            (key) => {

                                if (
                                    key !==
                                    CACHE_NAME
                                ) {

                                    return caches.delete(
                                        key
                                    );
                                }
                            }
                        )
                    )
                )
        );

        self.clients.claim();
    }
);

self.addEventListener(
    "fetch",
    (event) => {

        const url =
            new URL(
                event.request.url
            );

        // NEVER CACHE API
        if (
            url.pathname.startsWith(
                "/api"
            )
        ) {
            return;
        }

        // NEVER CACHE SUPABASE
        if (
            url.hostname.includes(
                "supabase"
            )
        ) {
            return;
        }

        // ONLY GET
        if (
            event.request.method !==
            "GET"
        ) {
            return;
        }

        event.respondWith(

            caches.match(
                event.request
            )
                .then(
                    (cached) => {

                        return (
                            cached ||
                            fetch(
                                event.request
                            )
                                .then(
                                    (
                                        response
                                    ) => {

                                        const cloned =
                                            response.clone();

                                        caches
                                            .open(
                                                CACHE_NAME
                                            )
                                            .then(
                                                (
                                                    cache
                                                ) => {

                                                    cache.put(
                                                        event.request,
                                                        cloned
                                                    );
                                                }
                                            );

                                        return response;
                                    }
                                )
                        );
                    }
                )
        );
    }
);