# PL-Tipping – Rekegutta ⚽

Premier League **tabelltipping** for vennegjengen. Alle tipper plasseringa til alle
20 laga før sesongstart. Du får poeng etter kor mange plassar du bomma med på kvart
lag – tippa du eit lag på 5. plass og dei enda på 8., får du 3 poeng.
**Færrast poeng totalt vinner.**

Hosted på GitHub Pages med Supabase som database.

---

## Kom i gang

### 1. Databasen
1. Gå til [supabase.com](https://supabase.com) → prosjektet ditt → **SQL Editor**
2. Kjør `sql/schema.sql` – lager tabellene `pl_teams`, `pl_users`, `pl_predictions`, `pl_settings`
3. Kjør `sql/seed.sql` – legger inn de 20 laga for 2026/27 og setter tippefristen

De gamle VM-tabellene (`teams`, `matches`, `app_users`, `predictions` …) blir ikke rørt.
Alt nytt har prefiks `pl_`.

### 2. Innstillinger
Åpne `admin.html` → **Innstillinger** og sett sesong, tippefrist og om andres tabeller
skal vises før fristen. `js/config.js` har bare reserveverdier – databasen bestemmer.

### 3. Del linken
Alle registrerer seg selv med navn + 4-sifret PIN. Ingen nettstedspassord.

---

## Slik brukes sida

| Fane | Hva den gjør |
|------|--------------|
| **Tabell** | Stillingen i konkurransen. Før sesongen: hvem som har låst. Trykk på en spiller for å se tabellen deres. |
| **Spå** | Din egen tabell. Dra i **⠿** eller bruk pilene for å flytte lag. Lagres automatisk. **Lås inn** når du er fornøyd. |
| **Spillere** | Alle deltakerne. Trykk på en for å se tabellen deres – sveip venstre/høyre for å bla mellom spillere. |
| **Fakta** | Statistikk: folkets mester, mest uenighet, modigste tips, gjengens fasit-tabell, hvem som skiller seg mest ut. |

Andres tabeller og fakta-sida er **skjult til tippefristen** så ingen kan kopiere.
Kan overstyres i admin.

---

## Admin

`admin.html`, passordbeskyttet (SHA-256-hash i `js/config.js`, generer ny i `setup.html`).

- **Fasit** – legg inn den faktiske tabellen ved å dra laga i rekkefølge. Kan oppdateres
  gjennom sesongen (spillerne ser da «foreløpig stilling»). Huk av
  *Sesongen er ferdig* når det er endelig.
- **Spillere** – lås opp en spiller som har låst for tidlig, eller slett en bruker.
- **Lag** – rett lagnavn, lagkode eller URL til klubbmerke.
- **Innstillinger** – sesong, tippefrist, vis alles tabeller nå.

---

## Poeng

```
poeng = |tippa plassering − faktisk plassering|,  summert over alle 20 lag
```

| Eksempel | Poeng |
|---|:-:|
| Arsenal tippa 2. – enda 1. | 1 |
| Everton tippa 9. – enda 16. | 7 |
| Liverpool tippa 3. – enda 3. | 0 |

**Premiering:** 1. plass 70 % · 2. plass 20 % · 3. plass 10 % · sisteplass betaler dobbelt.

---

## Filstruktur

```
/
├── index.html          Hovednettsted (SPA)
├── admin.html          Admin-panel
├── setup.html          Genererer passord-hasher
├── css/style.css       Stilark
├── js/
│   ├── config.js       ⚠️ Supabase-nøkler og reserveverdier
│   ├── app.js          Hoved-app-logikk
│   ├── scoring.js      Poengberegning + statistikk
│   ├── reorder.js      Dra-og-slipp for tabellrekkefølge
│   └── admin.js        Admin-panel
├── images/             Ball-logo og favicon
└── sql/
    ├── schema.sql      Databaseskjema
    └── seed.sql        De 20 laga
```

## Teknisk

- **Frontend:** vanilla HTML/CSS/JS, ingen rammeverk, ingen byggesteg
- **Database:** Supabase (PostgreSQL), anon-nøkkelen er tilgangsporten
- **Hosting:** GitHub Pages (statisk)
- **Klubbmerker:** eksterne bilde-URL-er i `pl_teams.logo_url`, med fargemerke som reserve
- **Mobil:** laget for telefon først – safe-area-støtte, 16px skjemafelt (ingen iOS-zoom),
  pointer-events-basert dra som ikke krasjer med scrolling

---

*Laget med kjærlighet til fotball og gode venner. Lykke til! 🦐*
