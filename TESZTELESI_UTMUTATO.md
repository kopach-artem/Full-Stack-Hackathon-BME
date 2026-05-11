# Tesztelési Útmutató

Ez a fájl a projekt gyors kézi teszteléséhez készült.

Tartalmazza:

- a demó felhasználókat
- a bejelentkezési adatokat
- a szerepkörönkénti tesztelési lépéseket
- a fő funkcionális ellenőrzési forgatókönyveket
- az automata tesztek futtatásának módját

## Előkészítés

A tesztelés előtt indítsd el a projektet.

Ha a repository már le van klónozva, futtasd:

```bash
pnpm install
docker compose up -d
cp backend/.env.example backend/.env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Windows PowerShell esetén:

```powershell
pnpm install
docker compose up -d
Copy-Item backend/.env.example backend/.env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Nyisd meg:

- Web: `http://localhost:5173`
- Backend health check: `http://localhost:4000/api/health`

## Automata tesztek futtatása

A repository tartalmaz egy PowerShell fájlt is az automata tesztek futtatásához:

```text
futtat_automata_tesztek.ps1
```

Ez a fájl a következőket végzi el:

- ellenőrzi a `backend/.env` fájlt
- elindítja a PostgreSQL adatbázist Docker Compose segítségével
- lefuttatja a migrációkat
- betölti a seed adatokat
- elindítja a Playwright automata teszteket

### Futtatás Windows PowerShell alatt

A repository gyökeréből futtasd:

```powershell
.\futtat_automata_tesztek.ps1
```

### Mit tesztelnek az automata tesztek

A jelenlegi Playwright tesztek az alábbi főbb eseteket fedik le:

- hibás bejelentkezés kezelése
- diák jogosultságkorlátozása admin és oktatói oldalaknál
- diák bejelentkezés, tantárgyak, jegyek, kijelentkezés
- admin seeded adatok megjelenítése
- oktatói tantárgy flow
- szuperadmin kezelőfelület

### Fontos megjegyzés

A Playwright konfiguráció automatikusan elindítja a webes alkalmazást a tesztek futása közben, ezért a `pnpm dev` külön indítása nem szükséges az automata tesztekhez.

Ha a PowerShell futtatási szabályzata blokkolja a scriptet, ideiglenesen futtasd így:

```powershell
powershell -ExecutionPolicy Bypass -File .\futtat_automata_tesztek.ps1
```

## Demó felhasználók

### Szuperadmin

```text
superadmin@school.edu / superadmin123
```

### Admin

```text
admin@school.edu / admin123
```

### Oktatók

```text
kovacs.peter@school.edu / teacher123
nagy.anna@school.edu / teacher123
```

### Diákok

```text
toth.bela@school.edu / student123
kiss.eva@school.edu / student123
molnar.adam@school.edu / student123
```

## Fő tesztelési cél

A rendszer fő bemutatási folyamata:

1. az admin felépíti az iskolai struktúrát
2. az oktató a saját tantárgyán belül jegyet rögzít
3. a diák megtekinti a saját tantárgyait és jegyeit
4. a szuperadmin kezeli az admin és szuperadmin fiókokat

## 1. Bejelentkezés tesztelése

### Mit ellenőrizzünk

- a bejelentkezési oldal betöltődik
- helyes adatokkal be lehet lépni
- hibás jelszó esetén hibaüzenet jelenik meg
- kijelentkezés után visszakerülünk a login oldalra

### Lépések

1. Nyisd meg: `http://localhost:5173/login`
2. Próbálj meg hibás jelszóval belépni
3. Ellenőrizd, hogy a rendszer nem enged be
4. Lépj be egy valós felhasználóval
5. Ellenőrizd, hogy a megfelelő dashboard nyílik meg
6. Kattints a `Logout` gombra
7. Ellenőrizd, hogy visszakerülsz a bejelentkezési oldalra

## 2. Szuperadmin tesztelése

### Bejelentkezés

```text
superadmin@school.edu / superadmin123
```

### Mit kell ellenőrizni

- a szuperadmin dashboard megjelenik
- admin és szuperadmin kezelőfelület elérhető
- új admin vagy szuperadmin létrehozható
- meglévő admin vagy szuperadmin szerkeszthető
- létrehozott tesztfelhasználó törölhető

### Javasolt lépések

1. Lépj be szuperadminként
2. Nyisd meg az admin kezelő oldalt
3. Hozz létre egy új admin felhasználót
4. Ellenőrizd, hogy megjelent a listában
5. Hozz létre egy új szuperadmin felhasználót
6. Ellenőrizd, hogy megjelent a listában
7. Szerkeszd az egyik új felhasználó nevét
8. Ellenőrizd, hogy a módosítás mentésre került
9. Töröld a létrehozott teszt felhasználókat

## 3. Admin tesztelése

### Bejelentkezés

```text
admin@school.edu / admin123
```

### Mit kell ellenőrizni

- admin dashboard betöltődik
- felhasználókezelés működik
- osztálykezelés működik
- tantárgykezelés működik
- tantárgy-hozzárendelések működnek

### 3.1 Felhasználókezelés

Ellenőrizd:

- diák létrehozása
- oktató létrehozása
- létező email címnél hiba jelenik meg
- diák csak osztályhoz rendelve hozható létre

Javasolt teszt:

1. Menj a felhasználókezelés oldalra
2. Hozz létre egy új diákot
3. Ellenőrizd, hogy megjelent a listában
4. Hozz létre egy új oktatót
5. Ellenőrizd, hogy megjelent a listában
6. Próbálj ugyanazzal az email címmel új felhasználót létrehozni
7. Ellenőrizd, hogy a rendszer hibát jelez

### 3.2 Osztálykezelés

Ellenőrizd:

- új osztály létrehozása
- duplikált osztály ne legyen létrehozható
- osztálylista helyesen jelenjen meg

Javasolt teszt:

1. Menj az osztálykezelés oldalra
2. Hozz létre egy új osztályt, például `2026/Z`
3. Ellenőrizd, hogy megjelent a listában
4. Próbáld újra létrehozni ugyanezt
5. Ellenőrizd, hogy a rendszer ezt blokkolja

### 3.3 Tantárgykezelés

Ellenőrizd:

- új tantárgy létrehozása
- tantárgy adatainak megjelenése
- tantárgy szerkesztése, ha az UI ezt támogatja

Javasolt teszt:

1. Menj a tantárgykezelés oldalra
2. Hozz létre egy új tantárgyat
3. Adj meg nevet, leírást és kötelező könyvet
4. Ellenőrizd, hogy a tantárgy megjelent a listában

### 3.4 Tantárgy-hozzárendelések

Ellenőrizd:

- tantárgy osztályhoz rendelése
- oktató hozzárendelése
- tanév megadása
- a létrehozott hozzárendelés megjelenik

Javasolt teszt:

1. Menj a tantárgy-hozzárendelések oldalra
2. Válassz ki egy osztályt
3. Válassz ki egy tantárgyat
4. Válassz ki egy oktatót
5. Add meg a tanévet
6. Mentsd el
7. Ellenőrizd, hogy a hozzárendelés megjelenik

## 4. Oktató tesztelése

### Bejelentkezés

```text
kovacs.peter@school.edu / teacher123
```

### Mit kell ellenőrizni

- az oktató csak a saját tantárgyait látja
- a saját osztályai diákjait látja
- tud jegyet rögzíteni
- a súlyozott átlag helyesen számolódik

### Javasolt teszt

1. Lépj be oktatóként
2. Nyisd meg a `My Subjects` oldalt
3. Ellenőrizd, hogy csak a saját hozzárendelt tantárgyak láthatók
4. Nyiss meg egy tantárgyat
5. Válassz ki egy diákot
6. Rögzíts egy normál jegyet, például:
   - érték: `5`
   - súly: `1`
   - típus: normál
7. Rögzíts egy második jegyet:
   - érték: `4`
   - súly: `3`
   - típus: normál
8. Ellenőrizd, hogy a jegyek megjelennek
9. Ellenőrizd, hogy az átlag frissül

### Külön ellenőrzés

Ha elérhető:

- félévi jegy rögzítése
- év végi jegy rögzítése
- ezek külön jelenjenek meg a normál jegyektől

## 5. Diák tesztelése

### Bejelentkezés

```text
toth.bela@school.edu / student123
```

### Mit kell ellenőrizni

- a diák dashboard betöltődik
- a saját osztály helyesen jelenik meg
- a saját tantárgyak láthatók
- csak a saját jegyek láthatók
- a normál súlyozott átlag megjelenik

### Javasolt teszt

1. Lépj be diákként
2. Ellenőrizd, hogy az osztály megjelenik a dashboardon
3. Nyisd meg a `My Subjects` oldalt
4. Ellenőrizd, hogy a saját osztály tantárgyai láthatók
5. Nyisd meg a `My Grades` oldalt
6. Ellenőrizd, hogy csak a saját jegyek láthatók
7. Ellenőrizd, hogy a normál súlyozott átlag megjelenik
8. Ha vannak speciális jegyek, ellenőrizd, hogy külön jelennek meg

## 6. Második diák ellenőrzése

### Bejelentkezés

```text
kiss.eva@school.edu / student123
```

### Mit kell ellenőrizni

- másik diák adatai nem láthatók
- csak a saját tantárgyak és saját jegyek érhetők el

### Javasolt teszt

1. Lépj be egy másik diákkal
2. Nyisd meg a jegyek oldalt
3. Ellenőrizd, hogy az előző diák jegyei nem jelennek meg

## 7. Jogosultsági tesztek

### Cél

Annak ellenőrzése, hogy minden szerepkör csak a számára engedélyezett felületeket és adatokat érje el.

### Javasolt ellenőrzések

#### Diákkal

1. Lépj be diákként
2. Próbáld meg megnyitni:
   - `/admin`
   - `/admin/users`
   - `/teacher`
3. Ellenőrizd, hogy nincs hozzáférés

#### Oktatóval

1. Lépj be oktatóként
2. Próbáld meg megnyitni:
   - `/admin`
   - `/superadmin`
3. Ellenőrizd, hogy nincs hozzáférés

#### Adminnal

1. Lépj be adminként
2. Próbáld meg megnyitni:
   - `/superadmin`
3. Ellenőrizd, hogy nincs hozzáférés

## 8. Gyors elfogadási teszt

Ha kevés idő van, legalább ezt a minimális flow-t érdemes lefuttatni:

1. Admin belép
2. Admin ellenőrzi az osztályokat, tantárgyakat és hozzárendeléseket
3. Oktató belép
4. Oktató egy diáknak jegyet rögzít
5. Diák belép
6. Diák ellenőrzi, hogy a jegy megjelent
7. Szuperadmin belép
8. Szuperadmin ellenőrzi az admin kezelést

## 9. Mit érdemes bemutatni a zsűrinek

Ajánlott sorrend:

1. Bejelentkezés és szerepkör-alapú irányítás
2. Admin felület
3. Oktatói jegyrögzítés
4. Diák nézet
5. Szuperadmin felület
6. README és lokális futtatás
7. Mobil kliens

## 10. Hiba esetén

Ha az adatbázis állapota elcsúszott, futtasd:

```bash
docker compose down -v
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Ha a `pnpm` hibát dob Windows alatt, használd a README-ben található `Windows pnpm / Corepack hibaelhárítás` részt.
