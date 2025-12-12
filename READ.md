# 🦅 Sky Hunter - Vanilla JS Edition

Ein pfeilschnelles Arcade-Game, gebaut mit reinem **Vanilla JavaScript** und **HTML5 Canvas**.

Kein React. Kein TypeScript. Kein komplexer Build-Prozess. Einfach nur Code.

![Sky Hunter](https://via.placeholder.com/800x600?text=Sky+Hunter+Preview)

## 🎮 Anleitung

1. **Jagen:** Klicke die Vögel an, bevor sie den Bildschirm verlassen.
2. **Überleben:** Jeder Vogel, der den rechten Rand erreicht, kostet ein Leben.
3. **Highscore:** Versuche deinen eigenen Rekord zu brechen!

## 🛠 Technik

*   **HTML5 Canvas:** Für das Rendering der Vögel und Partikel.
*   **Vanilla JS:** Komplette Spielelogik in `js/app.js`.
*   **Tailwind CSS (CDN):** Für das Styling des Interfaces, ohne npm-Installation nutzbar.

## 🚀 Deployment (Vercel)

Dieses Projekt ist bereit für Vercel. Da es keine Build-Steps gibt (es ist nur HTML/JS), ist das Deployment extrem einfach:

1. Push diesen Code auf **GitHub**.
2. Erstelle ein neues Projekt in **Vercel**.
3. Importiere das Repository.
4. **Wichtig:** Da es keine Build-Scripts gibt, lass die "Build Command" Einstellungen einfach leer. Vercel erkennt automatisch, dass es eine statische Seite ist.
5. Klicke **Deploy**.

## 💻 Lokal Starten

Einfach die `index.html` im Browser öffnen oder einen einfachen Server nutzen (z.B. Live Server in VS Code).
