require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { renderErrorPage } = require("./utils/errorTemplate");
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
const handlePageRequest = async (req, res, next) => {
  const { slug, pageSlug } = req.params;
  let faviconUrl = null;

  try {
    const endpoint = pageSlug
      ? `${SERVER_API_URL}/public/sites/${slug}/render/${pageSlug}`
      : `${SERVER_API_URL}/public/sites/${slug}/render`;

    const response = await fetch(endpoint);

    console.log(response.status, await response.clone().text()); // Log para depuración

    if (!response.ok) {
      try {
        const errorData = await response.clone().json();
        faviconUrl = errorData.favicon_url || null;
      } catch (e) {
        // ignore
      }

      if (response.status === 404) {
        try {
          const errorData = await response.clone().json();
          const isPageError = errorData.message === "Page not published";
          const isSiteError =
            errorData.message === "Site not published" ||
            errorData.message === "Site not found or not public";

          if (isPageError || isSiteError) {
            const errorTitle = isPageError
              ? "Página no publicada aún"
              : "Sitio no publicado aún";
            const errorDesc = isPageError
              ? "Esta página se encuentra actualmente en estado de borrador y no está disponible al público general."
              : "Este sitio se encuentra actualmente en estado de borrador y no está disponible al público general.";

            return res
              .status(403)
              .send(
                renderErrorPage(
                  "No Publicado",
                  errorTitle,
                  errorDesc,
                  faviconUrl,
                ),
              );
          }
        } catch (e) {
          // ignore parsing errors and proceed with normal 404 page
        }

        return res
          .status(404)
          .send(
            renderErrorPage(
              404,
              "Página no encontrada",
              "La página o el sitio que estás buscando no existe o ha sido movido.",
              faviconUrl,
            ),
          );
      }
      throw new Error(`Error en el servidor: ${response.status}`);
    }

    const { data } = await response.json();

    // Si la página concreta no está publicada (y no es preview)
    const isPreview = req.query.preview === "true";
    if (
      !isPreview &&
      data.page.status !== "published" &&
      data.page.status !== "active" &&
      data.page.status !== "public"
    ) {
      const pageFavicon = data.site.content?.favicon_url || null;
      return res
        .status(403)
        .send(
          renderErrorPage(
            "No Publicado",
            "Página no publicada aún",
            "Esta página se encuentra actualmente en estado de borrador y no está disponible al público general.",
            pageFavicon,
          ),
        );
    }

    const htmlContent = renderPage(data.page, data.site);
    res.send(htmlContent);
  } catch (error) {
    console.error("Error fetching page data:", error);
    res
      .status(500)
      .send(
        renderErrorPage(
          500,
          "Error interno del servidor",
          "Ha ocurrido un problema inesperado al cargar el sitio. Por favor, inténtelo de nuevo más tarde.",
          faviconUrl,
        ),
      );
  }
};

// Rutas para gestionar sitios y páginas (Express 5 syntax safe)
app.get("/", (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  res.redirect(clientUrl);
});
app.get("/:slug", handlePageRequest);
app.get("/:slug/:pageSlug", handlePageRequest);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res
    .status(404)
    .send(
      renderErrorPage(
        404,
        "Página no encontrada",
        "La ruta solicitada no es válida o no existe.",
      ),
    );
});

// Manejo de errores globales (500)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .send(
      renderErrorPage(
        500,
        "Error interno del servidor",
        "Ha ocurrido un error inesperado al procesar la solicitud.",
      ),
    );
});

app.listen(port, () => {
  console.log(`Site App listening on port ${port}`);
});