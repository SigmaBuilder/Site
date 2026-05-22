require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

const SERVER_API_URL =
  process.env.SERVER_API_URL || "http://localhost:5000/api/v1";

app.use(cors());

// Función de utilidad para renderizar HTML
const renderPage = (pageData, siteData) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="icon" href="${siteData.content.favicon_url || "/favicon.ico"}">
      <title>${pageData.title || "Sitio"}</title>
      <style>
        ${pageData.css || ""}
      </style>
    </head>
    <body>
      ${pageData.html || ""}
      
      <script>
        ${pageData.js || ""}
      </script>
    </body>
    </html>
  `;
};

// Función manejadora de la ruta
const handlePageRequest = async (req, res) => {
  const { slug, pageSlug } = req.params;

  try {
    const endpoint = pageSlug
      ? `${SERVER_API_URL}/public/sites/${slug}/render/${pageSlug}`
      : `${SERVER_API_URL}/public/sites/${slug}/render`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).send("<h1>404 - Página no encontrada</h1>");
      }
      throw new Error(`Error en el servidor: ${response.status}`);
    }

    const { data } = await response.json();

    const htmlContent = renderPage(data.page, data.site);
    res.send(htmlContent);
  } catch (error) {
    console.error("Error fetching page data:", error);
    res.status(500).send("<h1>500 - Error interno del servidor</h1>");
  }
};

// Rutas para gestionar sitios y páginas (Express 5 syntax safe)
app.get("/:slug", handlePageRequest);
app.get("/:slug/:pageSlug", handlePageRequest);

app.listen(port, () => {
  console.log(`Site App listening on port ${port}`);
});
