# PL-Tipping – Rekegutta ⚽

Premier League **tabelltipping** for vennegjengen. Alle tippar plasseringa til alle
20 laga før sesongstart. Du får poeng etter kor mange plassar du bomma med på kvart
lag – tippa du eit lag på 5. plass og dei enda på 8., får du 3 poeng.
**Færrast poeng totalt vinn.**

I tillegg kjem **bonusspørsmål** – prisar og ville tips. Kvart rette svar *trekk*
poeng frå totalen din.

Ligg på GitHub Pages med Supabase som database.

---

## Kom i gang

### 1. Databasen
1. Gå til [supabase.com](https://supabase.com) → prosjektet ditt → **SQL Editor**
2. Køyr `sql/schema.sql` – lagar `pl_teams`, `pl_users`, `pl_predictions`, `pl_settings`
3. Køyr `sql/seed.sql` – legg inn dei 20 laga for 2026/27 og set tippefristen
4. Køyr `sql/bonus.sql` – lagar `pl_bonus`, `pl_bonus_picks`, `pl_bonus_correct` og
   legg inn dei 15 bonusspørsmåla

### 2. Innstillingar
Opne `admin.html` → **Innstillingar** og set sesong, tippefrist og om tabellane til dei
andre skal visast før fristen. `js/config.js` har berre reserveverdiar – databasen bestemmer.

### 3. Del lenkja
Alle registrerer seg sjølve med namn + 4-sifra PIN. Ikkje noko nettstadpassord.

---

## Slik blir sida brukt

| Fane | Kva han gjer |
|------|--------------|
| **Tabell** | Stillinga i konkurransen. Før sesongen: kor mange som har fullført tabellen. Trykk på ein spelar for å sjå tabellen deira. |
| **Spå** | Din eigen tabell. Dra i **⠿** eller bruk pilene for å flytte lag. Blir lagra automatisk. |
| **Bonus** | 15 bonusspørsmål – prisar og ville tips. Skriv inn eit namn eller vel eit lag. Blir lagra automatisk. |
| **Spelarar** | Alle deltakarane. Trykk på ein for å sjå tabellen og bonussvara – sveip venstre/høgre for å bla mellom spelarane. |
| **Fakta** | Statistikk: folkemeisteren, mest usemje, modigaste tipsa, fasiten til gjengen, kven som skil seg mest ut. |

Tabellane og bonussvara til dei andre, og fakta-sida, er **skjulte til tippefristen**
så ingen kan kopiere. Kan overstyrast i admin.

### Ingen låsing
Det finst ingen lås-inn-knapp. Alt du gjer blir lagra automatisk, og du kan endre
både tabellen og bonussvara heilt **fram til fristen**. Når fristen går ut, stengjer
alt seg av seg sjølv.

---

## Admin

`admin.html`, passordbeskytta (SHA-256-hash i `js/config.js`, lag ny i `setup.html`).

- **Fasit** – legg inn den faktiske tabellen ved å dra laga i rekkjefølgje. Kan oppdaterast
  gjennom sesongen (spelarane ser då «førebels stilling»). Kryss av
  *Sesongen er ferdig* når han er endeleg.
- **Bonus** – fasit på bonusspørsmåla. Du ser alle svara spelarane har levert, gruppert
  etter skrivemåte («Haaland» og «haaland  » hamnar i same bunke), og hakar av for kva
  som er rett. Fleire skrivemåtar kan godkjennast på same spørsmål. Er det rette svaret
  ikkje med fordi ingen gjetta det, kan du leggje det inn sjølv.
- **Spelarar** – sjå kor langt kvar spelar har komme, eller slett ein brukar.
- **Lag** – rett lagnamn, lagkode eller URL til klubbmerke.
- **Innstillingar** – sesong, tippefrist, vis alle tabellar no.

---

## Poeng

```
poeng = |tippa plassering − faktisk plassering|,  summert over alle 20 lag
        − poeng for kvart rett bonussvar
```

| Eksempel | Poeng |
|---|:-:|
| Arsenal tippa 2. – enda 1. | 1 |
| Everton tippa 9. – enda 16. | 7 |
| Liverpool tippa 3. – enda 3. | 0 |
| Rett svar på eit bonusspørsmål | −2 eller −3 |

Bonusspørsmåla gjev til saman opptil **33 poeng** i frådrag.

**Premiering:** 1. plass 70 % · 2. plass 20 % · 3. plass 10 % · sisteplass betaler dobbelt.

---

## Filstruktur

```
/
├── index.html          Hovudnettstaden (SPA)
├── admin.html          Admin-panel
├── setup.html          Lagar passord-hash
├── css/style.css       Stilark
├── js/
│   ├── config.js       ⚠️ Supabase-nøklar og reserveverdiar
│   ├── app.js          Hovudlogikken
│   ├── scoring.js      Poengrekning, bonuspoeng + statistikk
│   ├── reorder.js      Dra-og-slepp for tabellrekkjefølgje
│   └── admin.js        Admin-panel
├── images/             Ball-logo og favicon
├── sql/
│   ├── schema.sql      Databaseskjema
│   ├── seed.sql        Dei 20 laga
│   └── bonus.sql       Bonusspørsmål – tabellar og dei 15 spørsmåla
├── .env                🔒 Postgres-passord – i .gitignore, aldri push
└── .env.example        Mal for .env
```

## Hemmelegheiter

`.env` inneheld Postgres-passordet til Supabase-prosjektet og ligg i `.gitignore`.
Den fila skal aldri til GitHub. Publishable/anon-nøkkelen er derimot ikkje hemmeleg
og ligg i `js/config.js` fordi nettlesaren treng han.

## Teknisk

- **Frontend:** vanilla HTML/CSS/JS, ingen rammeverk, ingen byggesteg
- **Database:** Supabase (PostgreSQL), anon-nøkkelen er tilgangsporten
- **Hosting:** GitHub Pages (statisk)
- **Klubbmerke:** eksterne bilet-URL-ar i `pl_teams.logo_url`, med fargemerke som reserve
- **Mobil:** laga for telefon først – safe-area-støtte, 16px skjemafelt (ingen iOS-zoom),
  pointer-events-basert draing som ikkje krasjar med scrolling

---

*Laga med kjærleik til fotball og gode vener. Lykke til! 🦐*
