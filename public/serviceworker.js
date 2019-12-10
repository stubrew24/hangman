importScripts("./cache-polyfill.js");

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open("hangman").then(function(cache) {
      return cache.addAll([
        "/",
        "./manifest.json",
        "./stylesheets/normalize.css",
        "./stylesheets/skeleton.css",
        "./stylesheets/style.css",
        "./scripts/game.js",
        "./scripts/index.js",
        "./scripts/alphabet.js",
        "./scripts/stages.js",
        "./scripts/start.js",
        "./images/icon.png"
      ]);
    })
  );
});

self.addEventListener("fetch", function(event) {
  console.log(event.request.url);

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
