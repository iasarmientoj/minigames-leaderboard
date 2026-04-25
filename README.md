# 🎮 Mini Games – Leaderboard con Google Sheets

Colección de minijuegos web estáticos con leaderboard en tiempo real usando Google Forms + Google Sheets.

## ¿Cómo funciona?

```
Jugador juega → Termina → Se envía score a Google Forms → Google Sheets lo registra → La web lee el CSV y muestra el leaderboard
```

### Tecnologías
- **HTML + CSS + JS** puro (sin frameworks, sin backend)
- **Google Forms** para recibir puntuaciones
- **Google Sheets** publicado como CSV para el leaderboard
- **GitHub Pages** para hosting gratuito

### Estructura de archivos
```
├── index.html    ← Página principal (pantallas: nombre, menú, juegos)
├── style.css     ← Estilos (tema oscuro, glassmorphism)
├── app.js        ← Lógica de juegos + envío de scores + leaderboard
└── README.md
```

## Formulario de Google

El formulario tiene 3 campos:
| Campo | Entry ID | Descripción |
|-------|----------|-------------|
| `id` | `entry.2011811816` | Identificador del juego (ej: `clicker`) |
| `player` | `entry.1562344733` | Nombre del jugador |
| `score` | `entry.1218031775` | Puntuación numérica |

**URL de envío (formResponse):**
```
https://docs.google.com/forms/d/e/1FAIpQLScFg_VcqzTJQlPUREWeQDGG2Qb_Ns2jcxZ7lLNiGAk935WQkg/formResponse?entry.2011811816=ID&entry.1562344733=NOMBRE&entry.1218031775=SCORE
```

El envío se hace cargando esa URL en un iframe oculto (evita CORS y no abre pestañas).

## Google Sheets (Leaderboard)

La hoja de cálculo está publicada como CSV:
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vTccpWJRHIvdjMj3uNPBvqQ6plzinFOdd4-Qc9fq71rkmR_GIYDD_lpU6tRP0bxMaEj-E-FN2mtiPLi/pub?gid=1866183539&single=true&output=csv
```

Columnas: `Marca temporal, id, player, score`

La web hace `fetch` al CSV, filtra por el `id` del juego y ordena por score descendente.

---

## 🤖 Prompt para crear nuevos juegos

Copia y pega esto a tu IA para que entienda la estructura y pueda crear más juegos:

---

> **CONTEXTO DEL PROYECTO:**
> 
> Tengo un proyecto de minijuegos web estáticos (HTML/CSS/JS puro) hospedado en GitHub Pages. Cada juego tiene un leaderboard que funciona así:
> 
> 1. Al terminar un juego, se envía el score a Google Forms con un iframe oculto
> 2. El leaderboard se lee de Google Sheets publicado como CSV
> 3. Cada juego tiene un `id` único (string) que se usa para filtrar en el leaderboard
> 
> **ARCHIVOS:**
> - `index.html` – Todas las pantallas. Cada juego es un `<div id="screen-NOMBRE" class="screen">` con estructura de dos columnas: panel del juego a la izquierda y panel del leaderboard a la derecha.
> - `style.css` – Estilos con tema oscuro y glassmorphism. Usa la fuente Outfit.
> - `app.js` – Toda la lógica. Ya tiene funciones reutilizables:
> 
> **FUNCIONES EXISTENTES QUE DEBES USAR:**
> - `navigateTo(screenId)` – Cambia entre pantallas
> - `submitScore(gameId, score)` – Envía la puntuación al Google Form
> - `loadLeaderboard(gameId)` – Carga el leaderboard para ese juego
> - `playerName` – Variable global con el nombre del jugador
> 
> **PARA AGREGAR UN NUEVO JUEGO NECESITO:**
> 
> 1. **En `index.html`:** Una nueva pantalla con este template:
> ```html
> <div id="screen-NOMBRE" class="screen">
>     <div class="game-layout">
>         <div class="card glass game-panel">
>             <button class="btn-back" onclick="navigateTo('screen-menu')">← Menú</button>
>             <h2 class="game-heading">EMOJI TITULO</h2>
>             <p class="game-instructions">Descripción corta</p>
>             <!-- Aquí va el contenido del juego -->
>         </div>
>         <div class="card glass leaderboard-panel">
>             <h3 class="lb-title">🏅 Leaderboard</h3>
>             <p class="lb-game-name">TITULO</p>
>             <button class="btn btn-small" onclick="loadLeaderboard('GAME_ID')">🔄 Actualizar</button>
>             <div id="leaderboard-GAME_ID" class="leaderboard-table">
>                 <p class="lb-loading">Cargando...</p>
>             </div>
>         </div>
>     </div>
> </div>
> ```
> 
> 2. **En `index.html` (menú):** Un botón en `.games-grid`:
> ```html
> <button class="game-card" onclick="navigateTo('screen-NOMBRE')">
>     <span class="game-icon">EMOJI</span>
>     <span class="game-title">TITULO</span>
>     <span class="game-desc">Descripción</span>
> </button>
> ```
> 
> 3. **En `app.js`:** Agregar el ID en `GAME_IDS`, la lógica del juego, y al final llamar:
> ```javascript
> submitScore('GAME_ID', puntuacionFinal);
> ```
> 
> 4. **En `app.js` (navigateTo):** Agregar un `if` para cargar el leaderboard al entrar:
> ```javascript
> if (screenId === 'screen-NOMBRE') {
>     // resetear estado del juego
>     loadLeaderboard('GAME_ID');
> }
> ```
> 
> **REGLAS:**
> - El `GAME_ID` debe ser un string corto sin espacios (ej: `memory`, `reaction`, `snake`)
> - El score siempre es un número (mayor es mejor)
> - No uses frameworks ni dependencias externas
> - Mantén el mismo estilo visual (clases CSS existentes: `btn`, `btn-primary`, `stat-box`, `result-card`, etc.)

---

## Juegos incluidos

| Juego | ID | Descripción |
|-------|-----|-------------|
| Speed Clicker | `clicker` | Haz el mayor número de clics en 30 segundos |
