📖 Descripción

Este proyecto permite:

- 👤 Registro e inicio de sesión con Firebase Authentication
- 💾 Guardar y gestionar usuarios y favoritos en Firebase Firestore
- 🌍 Visualizar terremotos en mapas interactivos usando Leaflet
- 🔎 Filtrar terremotos por magnitud y fecha
⭐-  Añadir y eliminar terremotos favoritos desde el popup del mapa

🛠 Tecnologías usadas

- HTML, CSS, JavaScript
- Leaflet.js
- Firebase (Authentication y Firestore)
- USGS Earthquake API

⚡ Funcionalidades principales
<details> <summary>Autenticación 🔑</summary>

Registro de usuarios con email y contraseña

Login de usuarios existentes

Logout y control de sesión en tiempo real

</details> <details> <summary>Mapas de terremotos 🗺</summary>

Mapa principal (mapAll) con todos los terremotos de la API

Mapa filtrado (mapFiltered) con filtros de magnitud mínima (1–7) y fechas

</details> <details> <summary>Favoritos ⭐</summary>

Añadir terremotos a favoritos desde el popup (solo usuarios logados)

Eliminar favoritos desde el popup en la vista de favoritos

Evita duplicados en Firestore

</details> <details> <summary>Interfaz 🖥</summary>

Botones en la barra superior: Login, Registrarse, Logout, Mostrar Favoritos, Mostrar API

Formularios ocultos para login y registro

Mensaje de bienvenida con el nombre del usuario logado

</details>

📦 Dependencias

- Leaflet.js (CDN incluido en HTML)
- Firebase JS SDK v8 (Auth y Firestore)

🎨 Ejemplos de uso

- Filtrar terremotos por magnitud mínima (1–7)
- Añadir un terremoto a favoritos desde el popup
- Mostrar favoritos y eliminar desde el popup