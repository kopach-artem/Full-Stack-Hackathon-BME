# BME Oktatási Portál

Teljes veremű középiskolai oktatásszervezési portál a BME fullstack és mobil fejlesztői versenyére.

A megoldás fejlesztése során a fő hangsúly elsősorban a backend architektúrán, az adatmodellen, a jogosultságkezelésen és a stabil végpontokon volt. A webes és mobil felületek ehhez a backend központú alaphoz készültek demonstrációs és használati célra.

A projekt lokálisan futtatható, szerepkör-alapú, demó adatokkal előkészített, és az alábbi részeket tartalmazza:

- webes kliens
- backend API
- PostgreSQL Docker Compose használatával
- Prisma ORM
- Expo mobil kliens
- Playwright végponttól végpontig tesztek
- külön magyar tesztelési útmutató
- automata PowerShell tesztfuttató script
- külön PowerShell indító script a webes futtatáshoz
- külön PowerShell indító script a mobil futtatáshoz

## Fő funkciók

- JWT alapú hitelesítés és szerepkör-alapú jogosultságkezelés
- Négy szerepkör:
  - `SUPERADMIN`
  - `ADMIN`
  - `TEACHER`
  - `STUDENT`
- Iskolai struktúra kezelése:
  - osztályok
  - tantárgyak
  - felhasználók
  - tantárgy-hozzárendelések
- Oktatói folyamat:
  - saját hozzárendelt tantárgyak megtekintése
  - jegyek rögzítése a saját osztályok diákjai számára
  - súlyozott jegyek használata
- Diák folyamat:
  - saját osztály megtekintése
  - saját tantárgyak megtekintése
  - csak a saját jegyek megtekintése
  - súlyozott átlag megjelenítése a normál jegyekből
  - speciális jegytípusok külön megjelenítése
- Szuperadmin folyamat:
  - admin és szuperadmin fiókok kezelése
- Mobil kliens diák és oktató felületekkel, külön webes adminisztrációs fókusz mellett
- Playwright alapú böngészős E2E tesztek

## Technológiai stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Adatbázis: PostgreSQL
- ORM: Prisma
- Mobil: Expo + React Native
- Csomagkezelő: pnpm
- Validáció / auth: Zod, JWT, bcrypt
- Tesztelés: Playwright

## Projektstruktúra

```text
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    middleware/
    routes/
    index.ts
    prisma.ts
frontend/
  src/
    api/
    context/
    pages/
mobile/
  src/
    api/
    context/
    navigation/
    screens/
tests/
  e2e/
docker-compose.yml
futtat_automata_tesztek.ps1
indit_mobil.ps1
indit_web.ps1
inditasi_segedlet.ps1
package.json
pnpm-workspace.yaml
README.md
TESZTELESI_UTMUTATO.md
```

## Megvalósított webes oldalak

### Közös

- Bejelentkezési oldal
- Védett route-ok
- Szerepkör-alapú navigáció

### Admin

- Dashboard
- Felhasználókezelés
- Osztálykezelés
- Tantárgykezelés
- Tantárgy-hozzárendelések kezelése

### Oktató

- Dashboard
- Saját tantárgyak
- Jegyrögzítés

### Diák

- Dashboard
- Saját tantárgyak
- Saját jegyek

### Szuperadmin

- Dashboard
- Admin és szuperadmin kezelés

## Domain modell

A jelenlegi Prisma séma egy iskolai portál köré épül:

- `Role`
- `User`
- `Class`
- `Subject`
- `SubjectAssignment`
- `Grade`

Alap üzleti szabályok:

- egy diák pontosan egy osztályhoz tartozik
- egy tantárgy adott tanévben osztályhoz és oktatóhoz van rendelve
- egy oktató csak a saját hozzárendelt tantárgyain belül adhat jegyet
- egy diák csak a saját adatait láthatja

## Előfeltételek

A futtatás előtt ezek legyenek telepítve:

1. Git
2. Node.js 20+ vagy 22+
3. pnpm
4. Docker Desktop

Javasolt ellenőrző parancsok:

```bash
git --version
node --version
pnpm --version
docker --version
docker compose version
```

## Teljes indítás nulláról

### 1. A repository klónozása

```bash
git clone https://github.com/kopach-artem/Full-Stack-Hackathon-BME.git
cd Full-Stack-Hackathon-BME
```

### 2. A szükséges eszközök ellenőrzése

Futtasd ezeket:

```bash
git --version
node --version
pnpm --version
docker --version
docker compose version
```

Mindegyik parancsnak telepített verziót kell visszaadnia.

### 3. Függőségek telepítése

```bash
pnpm install
```

Ha Windows alatt a `pnpm` Corepack signature hibával leáll, ugorj a lentebbi `Windows pnpm / Corepack hibaelhárítás` részhez, és használd az ott leírt kerülő megoldást.

### 4. Backend környezeti fájl létrehozása

macOS/Linux:

```bash
cp backend/.env.example backend/.env
```

Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

### 5. PostgreSQL indítása Docker Compose segítségével

```bash
docker compose up -d
```

Opcionális ellenőrzés:

```bash
docker compose ps
```

A PostgreSQL konténernek futnia kell, és egészséges állapotban kell lennie.

### 6. Prisma migráció futtatása

```bash
pnpm db:migrate
```

### 7. Demó adatok betöltése

```bash
pnpm db:seed
```

### 8. A webes frontend és a backend indítása

```bash
pnpm dev
```

Ez elindítja:

- a backendet a `http://localhost:4000` címen
- a frontendet a `http://localhost:5173` címen

### 9. A projekt megnyitása

Nyisd meg ezeket a címeket a böngészőben:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:4000/api/health`

## Gyors PowerShell indító scriptek

Windows alatt a projekt kényelmes indításához két külön script is rendelkezésre áll.

### Web indító script

```powershell
.\indit_web.ps1
```

Ez a script automatikusan:

- ellenőrzi a `backend/.env` fájlt
- ellenőrzi a `pnpm` elérhetőségét
- szükség esetén telepíti a projekt függőségeit
- elindítja vagy újrahasznosítja a PostgreSQL konténert
- lefuttatja a migrációkat
- betölti a seed adatokat
- elindítja a frontend + backend fejlesztői módot

### Mobil indító script

```powershell
.\indit_mobil.ps1
```

Ez a script automatikusan:

- elvégzi az alap környezet-előkészítést
- ellenőrzi, hogy a backend API elérhető-e
- szükség esetén elindítja a backend szervert
- elindítja az Expo mobil klienst

Támogatott módok:

```powershell
.\indit_mobil.ps1
.\indit_mobil.ps1 -Mod android
.\indit_mobil.ps1 -Mod ios
.\indit_mobil.ps1 -Mod web
```

Jelentésük:

- `expo`: normál Expo indítás
- `android`: Android emulátor
- `ios`: iOS szimulátor
- `web`: mobil web nézet Expo alatt

## Demó fiókok

Ezeket a fiókokat a `pnpm db:seed` hozza létre.

```text
superadmin@school.edu / superadmin123
admin@school.edu / admin123
kovacs.peter@school.edu / teacher123
nagy.anna@school.edu / teacher123
toth.bela@school.edu / student123
kiss.eva@school.edu / student123
molnar.adam@school.edu / student123
```

## Gyors demó forgatókönyv

### Admin

Bejelentkezés:

```text
admin@school.edu / admin123
```

Mutasd meg:

- felhasználók
- osztályok
- tantárgyak
- tantárgy-hozzárendelések

### Oktató

Bejelentkezés:

```text
kovacs.peter@school.edu / teacher123
```

Mutasd meg:

- hozzárendelt tantárgyak
- diáklista
- jegyrögzítés
- súlyozott értékelési folyamat

### Diák

Bejelentkezés:

```text
toth.bela@school.edu / student123
```

Mutasd meg:

- saját osztály
- saját tantárgyak
- saját jegyek
- normál jegyekből számolt súlyozott átlag

### Szuperadmin

Bejelentkezés:

```text
superadmin@school.edu / superadmin123
```

Mutasd meg:

- admin kezelés
- szuperadmin kezelés

## Mobil kliens

A repository tartalmaz egy külön Expo mobil klienst a `mobile/` mappában.

A jelenlegi mobil funkcionalitás:

- bejelentkezés
- diák dashboard
- diák tantárgylista
- diák jegyek és átlagok
- oktatói tantárgylista
- oktatói jegyrögzítés
- mobil web futtatás Expo segítségével
- admin/szuperadmin esetén egy tájékoztató képernyő, amely a webes felület használatát javasolja az adminisztrációhoz

Fontos: a projekt fő funkcionalitása és a legteljesebb adminisztrációs élmény a backend + webes felület köré készült. A mobil kliens elsősorban demonstrációs és bónusz funkcionalitás, főként diák és oktató nézetekhez.

### A mobil kliens indítása

Először fusson a backend és az adatbázis. A mobil kliens önmagában nem elég, mert a bejelentkezéshez és az adatok lekéréséhez szüksége van a lokálisan futó API-ra.

```bash
docker compose up -d
pnpm dev
```

Ezután egy másik terminálban:

```bash
pnpm mobile
```

Ez az Expo fejlesztői szervert indítja el. Innen többféleképpen lehet továbblépni:

- Android emulátor: `a`
- mobil web: `w`
- Expo Go fizikai eszközön: QR kód beolvasása

### Mobil futtatási módok

#### 1. Android emulátor

Az alapértelmezett beállítás ehhez van optimalizálva.

```bash
pnpm mobile:android
```

PowerShell script használatával:

```powershell
.\indit_mobil.ps1 -Mod android
```

Az alap API URL ebben az esetben:

```text
http://10.0.2.2:4000
```

#### 2. iOS szimulátor

```bash
pnpm mobile:ios
```

PowerShell script használatával:

```powershell
.\indit_mobil.ps1 -Mod ios
```

Itt általában ez működik:

```text
http://localhost:4000
```

#### 3. Mobil web Expo alatt

Ha böngészőben szeretnéd tesztelni a mobil klienst:

```bash
pnpm mobile
```

Majd az Expo terminálban nyomd meg:

```text
w
```

Mobil web esetén a backendnek futnia kell, és a kliens `http://localhost:4000` címen éri el az API-t.

Közvetlen PowerShell script használatával:

```powershell
.\indit_mobil.ps1 -Mod web
```

#### 4. Fizikai telefon Expo Go-val

Ebben az esetben hozz létre egy `mobile/.env` fájlt a `mobile/.env.example` alapján, és állítsd be a saját géped helyi IP-címét.

Hasznos mobil parancsok:

```bash
pnpm mobile
pnpm mobile:android
pnpm mobile:ios
pnpm mobile:typecheck
```

### Mobil API URL

Alapértelmezett mobil API URL Android emulátorhoz:

```text
http://10.0.2.2:4000
```

Ez az Android emulátorhoz megfelelő.

iOS szimulátor esetén általában a `http://localhost:4000` működik.

Mobil web esetén szintén a `http://localhost:4000` a megfelelő.

Fizikai eszköz esetén hozd létre a `mobile/.env` fájlt a `mobile/.env.example` alapján, és állítsd be ezt:

```text
EXPO_PUBLIC_API_URL=http://<SAJAT_HELYI_IP>:4000
```

Példa:

```text
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000
```

## Végponttól végpontig tesztek

A Playwright tesztek a `tests/e2e/` mappában találhatók.

Összes teszt futtatása:

```bash
pnpm test:e2e
```

Csak a diák flow futtatása:

```bash
pnpm test:e2e:student
```

A diák flow futtatása látható böngészőablakkal:

```bash
pnpm test:e2e:student:headed
```

## Kézi és automata tesztelési fájlok

A repository két külön fájlt is tartalmaz a tesztelés megkönnyítésére:

### 1. Kézi tesztelési útmutató

```text
TESZTELESI_UTMUTATO.md
```

Ez a fájl tartalmazza:

- a demó felhasználókat
- a bejelentkezési adatokat
- a szerepkörönkénti tesztelési lépéseket
- a jogosultsági ellenőrzéseket
- a bemutatási sorrendre vonatkozó javaslatot

### 2. Automata tesztfuttató script

```text
futtat_automata_tesztek.ps1
```

Ez a PowerShell script:

- ellenőrzi a `backend/.env` fájlt
- elindítja a PostgreSQL adatbázist
- lefuttatja a migrációkat
- betölti a seed adatokat
- elindítja a Playwright E2E teszteket

Futtatás Windows PowerShell alatt:

```powershell
.\futtat_automata_tesztek.ps1
```

Ha a PowerShell futtatási szabályzata blokkolja:

```powershell
powershell -ExecutionPolicy Bypass -File .\futtat_automata_tesztek.ps1
```

## Hasznos parancsok

```bash
pnpm dev
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
pnpm mobile
pnpm mobile:android
pnpm mobile:ios
pnpm mobile:typecheck
pnpm test:e2e
docker compose up -d
docker compose down
```

## Tiszta újraindítás

Ha az adatbázis rossz állapotba került, és nem gond a lokális PostgreSQL adatok törlése:

```bash
docker compose down -v
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Build ellenőrzés

A backend és a frontend production build ellenőrzéséhez:

```bash
pnpm build
```

## Windows pnpm / Corepack hibaelhárítás

Ha a `pnpm` Windows alatt Corepack signature hibával leáll, használd ezt a kerülő megoldást:

1. Telepítsd globálisan a pnpm-et:

```powershell
npm install -g pnpm
```

2. Használd közvetlenül az npm által telepített pnpm-et:

```powershell
& "$env:APPDATA\npm\pnpm.cmd" install
& "$env:APPDATA\npm\pnpm.cmd" db:migrate
& "$env:APPDATA\npm\pnpm.cmd" db:seed
& "$env:APPDATA\npm\pnpm.cmd" dev
```

Szükség esetén ellenőrizheted az elérési utat is:

```powershell
where.exe pnpm
```

Ha nem szeretnéd minden parancsnál kézzel megadni ezt az útvonalat, használd inkább a PowerShell indító scripteket:

```powershell
.\indit_web.ps1
.\indit_mobil.ps1
```

## Környezeti fájlok

### Backend

`backend/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/education_portal?schema=public"
PORT=4000
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="change-me-in-production"
```

### Mobil

`mobile/.env`

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

## Mit kell futtatnia a zsűrinek

Friss klónozás után a legrövidebb út:

```bash
pnpm install
docker compose up -d
cp backend/.env.example backend/.env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Ezután megnyitandó:

- `http://localhost:5173`

Ez a fő webes változat, és ez tartalmazza a legteljesebb adminisztrációs funkcionalitást.

Ha a mobil klienst is szeretnék kipróbálni:

```bash
pnpm mobile
```

Majd az Expo felületén:

- `a` Android emulátorhoz
- `w` mobil web nézethez

Windows alatt egyszerűbb alternatíva:

```powershell
.\indit_web.ps1
.\indit_mobil.ps1 -Mod web
```

## A projekt jelenlegi fókusza

Ez egy versenyre szánt MVP, amely elsősorban az alábbiakra koncentrál:

- erős backend alapok
- tiszta adatmodell és Prisma kapcsolatok
- szerepkör-alapú jogosultságkezelés
- stabil API végpontok
- megbízható lokális futtatás
- admin, oktató, diák és szuperadmin folyamatok
- demóra előkészített seed adatok
- reszponzív webes felület
- mobil bónusz kliens

Szándékosan kompakt, és úgy lett kialakítva, hogy a verseny során könnyen továbbfejleszthető legyen. A fejlesztési prioritás egyértelműen a backend és a teljes üzleti logika stabil megvalósítása volt; a mobil kliens erre épülő kiegészítő demonstrációs réteg.
