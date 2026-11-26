# Tweak Cleaner

Kendi hesabının mesajlarını ID'ye göre temizleyen araç.

## Kurulum

npm.cmd install

## Ayar

`start.bat` sorar: token, ID ve backup (true/false). Değerler ortam değişkeni olarak aktarılır; `Settings.ts` dosyasına yazılmaz.

- `TOKEN` — hesabının token'ı
- `ID` — DM, sunucu, ses kanalı veya normal kanal ID'si
- `BACKUP` — `true` ise silinen mesajlar `Backup/` altına kaydedilir

## Çalıştırma

npm.cmd start

## ID türleri

- DM ID → o DM'deki mesajlar
- Sunucu ID → sunucudaki tüm metin ve ses kanalları
- Ses kanalı ID → o kanalın sohbeti
- Normal kanal ID → o kanaldaki mesajlar

## Yapı

- `System/Client` — API istekleri ve rate limit
- `System/Resolver` — ID türünü çözer
- `System/Cleaner` — mesajları tarar, siler, yedekler
- `System/index` — giriş noktası
