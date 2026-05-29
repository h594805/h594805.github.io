# VM 2026 Tipping – Rekegruppa 🏆

Privat VM-tippeside for vennegjengen. Hosted på GitHub Pages med Supabase som database.

## Hurtigstart

### 1. Supabase-oppsett
1. Gå til [supabase.com](https://supabase.com) og logg inn i ditt prosjekt
2. Åpne **SQL Editor**
3. Kjør `sql/schema.sql` (lager alle tabellene)
4. Kjør `sql/seed.sql` (fyller inn alle 48 lag og 104 kamper)

### 2. Konfigurer nettsiden
1. Åpne `setup.html` i nettleseren (eller åpne filen direkte)
2. Skriv inn ønskede passord og kopier SHA-256-hashene
3. Åpne `js/config.js` og fyll inn:
   - `SUPABASE_URL` – fra Supabase → Project Settings → API
   - `SUPABASE_ANON_KEY` – fra Supabase → Project Settings → API (anon public)
   - `SITE_PASSWORD_HASH` – SHA-256 av nettstedspassordet
   - `ADMIN_PASSWORD_HASH` – SHA-256 av adminpassordet

### 3. Publiser til GitHub Pages
1. Zip hele mappen (uten `.git`-mappe)
2. Opprett et nytt GitHub-repo og push filene
3. Gå til repo → Settings → Pages → velg `main`-branch
4. Pek `rekegruppa.no` til GitHub Pages via CNAME-record

### 4. Del med gruppa
Del nettstedsadressen og passordet med alle deltakere. De oppretter sin egen bruker med navn + 4-sifret PIN.

---

## Funksjoner

- 🔒 **Passordbeskyttet** nettsted – kun de med passordet kan gå inn
- 👤 **Brukerprofil** – brukernavn (navn) + 4-sifret PIN
- ⚽ **Tipping** – tippe eksakt resultat for alle 104 kamper
- 🏆 **Tabell** – poengstilling med rangering i sanntid
- 🏅 **Prisprediksjon** – beste spiller og toppscorer
- ⚙️ **Admin-panel** – oppdater kampresultater, ekstraomganger, straffer

## Poengsystem

| Runde | Eksakt resultat | Riktig utfall |
|-------|:-:|:-:|
| Gruppespill | 3p | 3 |
| Runde av 32 | 4p | 3p |
| Åttedelsfinale | 5p | 3p |
| Kvartfinale | 6p | 4p |
| Semifinale | 7p | 4p |
| Bronsefinale | 8p | 4p |
| Finale | **10p** | **5p** |

**Ekstraomganger:** Dersom kampen går til e.o., gjelder AET-resultatet (ikke straffespark) for poengberegningen.

**Prisprediksjon:**
- Riktig spiller, riktig plassering: 10p
- Riktig spiller, feil plassering (innen topp 3): 5p

## Filstruktur

```
/
├── index.html          Hovednettsted (SPA)
├── admin.html          Admin-panel
├── setup.html          Oppsettverktøy
├── css/
│   └── style.css       Stilark (VM 2026-tema)
├── js/
│   ├── config.js       ⚠️ Fyll inn dine nøkler her
│   ├── app.js          Hoved-app-logikk
│   ├── scoring.js      Poengberegning
│   └── admin.js        Admin-panel-logikk
└── sql/
    ├── schema.sql      Databaseskjema
    └── seed.sql        Lag og kampdata (48 lag, 104 kamper)
```

## Admin-panel

Gå til `admin.html` for å:
- Oppdatere kampresultater etter hvert som de spilles
- Legge inn ekstraomganger og straffespark-resultat
- Sette opp knockout-kamper (R32, R16, osv.) med faktiske lag
- Slette brukere
- Legge inn prisvinnere etter turneringen

## VM 2026 Grupper

| Gruppe | Lag |
|--------|-----|
| A | Mexico, Sør-Afrika, Sør-Korea, Tsjekkia |
| B | Canada, Bosnia-Hercegovina, Qatar, Sveits |
| C | Brasil, Marokko, Haiti, Skottland |
| D | USA, Paraguay, Australia, Tyrkia |
| E | Tyskland, Curaçao, Elfenbenskysten, Ecuador |
| F | Nederland, Japan, Sverige, Tunisia |
| G | Belgia, Egypt, Iran, New Zealand |
| H | Spania, Kapp Verde, Saudi-Arabia, Uruguay |
| I | Frankrike, Senegal, Irak, Norge |
| J | Argentina, Algerie, Østerrike, Jordan |
| K | Portugal, DR Kongo, Usbekistan, Colombia |
| L | England, Kroatia, Ghana, Panama |

## Teknisk

- **Frontend:** Vanilla HTML/CSS/JavaScript (ingen rammeverk)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** GitHub Pages (statisk)
- **Flagg:** flagcdn.com
- **Fonter:** Barlow / Barlow Condensed (Google Fonts)

---

*Laget med kjærlighet til fotball og gode venner. Lykke til! ⚽🏆*
