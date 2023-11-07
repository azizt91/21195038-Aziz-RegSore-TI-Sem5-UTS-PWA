// service-worker.js

// Nama cache Anda
var cacheName = 'profile-aziz-v1';

// Daftar sumber daya yang ingin Anda cache
var filesToCache = [
    '/',
    '/index.html',
    '/service-worker.js',
    '/indexeddb.js',
    '/manifest.json',
    '/css/style.css',
    '/img/icon-72x72.png',
    '/img/icon-96x96.png',
    '/img/icon-128x128.png',
    '/img/icon-144x144.png',
    '/img/icon-152x152.png',
    '/img/icon-192x192.png',
    '/img/icon-384x384.png',
    '/img/icon-512x512.png',
    '/img/happy.png',
    '/img/sad.png',
    '/img/profile.jpg',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.3/font/bootstrap-icons.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css'
];

// Instalasi Service Worker
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
        })
    );
});

// Aktivasi Service Worker
self.addEventListener('activate', evt => {

});

// Fetching sumber daya dari cache atau jaringan
// self.addEventListener('fetch', evt => {
//     evt.respondWith(
//         caches.match(evt.request).then(cacheRes => {
//             // Menggunakan sumber daya dari cache jika ada
//             return cacheRes || fetch(evt.request);
//         })
//     );
// });

self.addEventListener('fetch', function(event) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          // Data berhasil diambil dari jaringan, cache data tersebut
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open('my-cache').then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(function() {
          // Jika gagal mengambil data dari jaringan, coba ambil dari cache
          return caches.match(event.request);
   })
  );
  });

  self.addEventListener('push', function(event) {
    if (self.Notification.permission === 'granted') {
      // Izin notifikasi telah diberikan, Anda dapat menampilkan pemberitahuan
      const options = {
        body: 'Apakah bapak mau memberi nilai "A" kepada saya??',
        icon: '/img/icon-96x96.png',
        actions: [
          { action: 'yes', title: 'Ya' },
          { action: 'no', title: 'Tidak' }
        ],
        data: {
          senderId: '12345',
          messageId: '67890'
        },
        silent: true,
        timestamp: Date.now()
      };
      
  
      event.waitUntil(
        self.registration.showNotification('Notifikasi', options)
      );
    } else {
      // Izin notifikasi tidak diberikan
    }
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
  
    if (event.action === 'yes') {
      // Tindakan "Ya" diambil
      // Menampilkan notifikasi dengan ucapan "Anda memilih Ya"
      self.registration.showNotification('Terimakasih', {
        body: 'Terimakasih Bapak sudah baik, memberi nilai yang bagus kepada saya',
        icon: '/img/happy.png'
      });
    } else if (event.action === 'no') {
      // Tindakan "Tidak" diambil
      // Menampilkan notifikasi dengan ucapan "Anda memilih Tidak"
      self.registration.showNotification('Duhhh pak pak', {
        body: 'Gak papa wis...',
        icon: '/img/sad.png'
      });
    } else {
      // Notifikasi di-klik tanpa memilih tindakan apa pun
      // Lakukan sesuatu ketika notifikasi di-klik tanpa memilih "Ya" atau "Tidak"
      console.log('Anda mengklik notifikasi');
    }
  });
  
  
  

  