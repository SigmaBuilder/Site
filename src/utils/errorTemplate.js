'use strict';

const pathData = "M 0 0 L 100 0 L 100 100 L 0 100 Z M 82 13 L 82 35 L 70 35 L 70 24 L 36 24 L 57 49 L 36 75 L 70 75 L 70 64 L 82 64 L 82 86 L 18 86 L 18 76 L 41 49 L 18 22 L 18 13 Z";

/**
 * Renders a premium error page using the SigmaBuilder loader design.
 * 
 * @param {number|string} status - HTTP status code (e.g. 404, 500).
 * @param {string} title - Error title (e.g. 'Página no encontrada').
 * @param {string} description - Descriptive explanation of the error.
 * @returns {string} Fully styled HTML document.
 */
const renderErrorPage = (status, title, description, faviconUrl = null) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="${faviconUrl || "/favicon.ico"}">
  <title>${status} - ${title} | SigmaBuilder</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');

    :root {
      --background: oklch(1 0 0);
      --foreground: oklch(0.145 0 0);
      --primary: oklch(0.205 0 0);
      --primary-foreground: oklch(0.985 0 0);
      --muted-foreground: oklch(0.556 0 0);
      --border: oklch(0.922 0 0);
      --radius: 0.625rem;
      --glow-color: rgba(0, 0, 0, 0.02);
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --background: oklch(0.145 0 0);
        --foreground: oklch(0.985 0 0);
        --primary: oklch(0.922 0 0);
        --primary-foreground: oklch(0.205 0 0);
        --muted-foreground: oklch(0.708 0 0);
        --border: rgba(255, 255, 255, 0.1);
        --glow-color: rgba(255, 255, 255, 0.02);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--background);
      color: var(--foreground);
      font-family: 'Geist', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 2rem;
      transition: background-color 0.3s ease, color 0.3s ease;
      position: relative;
    }

    .ambient-light {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, var(--glow-color) 0%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      pointer-events: none;
    }

    .content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 480px;
      width: 100%;
    }

    .logo-container {
      width: 160px;
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
      position: relative;
    }

    .logo-svg {
      width: 100%;
      height: 100%;
    }

    @keyframes minimalistFlow {
      from {
        stroke-dashoffset: 800;
      }
      to {
        stroke-dashoffset: 0;
      }
    }

    .bg-path {
      stroke: var(--primary);
      opacity: 0.15;
      transition: stroke 0.3s ease;
    }

    .trace-line {
      stroke: var(--primary);
      stroke-dasharray: 80 320;
      animation: minimalistFlow 2.5s linear infinite;
      stroke-linecap: square;
      transition: stroke 0.3s ease;
    }

    .status-code {
      font-size: 4.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 0.5rem;
      letter-spacing: -0.04em;
      background: linear-gradient(180deg, var(--foreground) 50%, var(--muted-foreground));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .error-title {
      font-size: 1.35rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }

    .error-description {
      font-size: 0.95rem;
      color: var(--muted-foreground);
      line-height: 1.6;
      margin-bottom: 2.5rem;
      font-weight: 400;
    }

    .button-group {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      width: 100%;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: var(--radius);
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      border: 1px solid transparent;
      outline: none;
    }

    .btn-primary {
      background-color: var(--primary);
      color: var(--primary-foreground);
    }

    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .btn-secondary {
      background-color: transparent;
      color: var(--foreground);
      border-color: var(--border);
    }

    .btn-secondary:hover {
      background-color: var(--border);
      transform: translateY(-1px);
    }

    @media (max-width: 480px) {
      .button-group {
        flex-direction: column;
        gap: 0.5rem;
      }
      .btn {
        width: 100%;
      }
      .logo-container {
        width: 130px;
        height: 130px;
        margin-bottom: 1.5rem;
      }
      .status-code {
        font-size: 3.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="ambient-light"></div>
  <div class="content">
    <div class="logo-container">
      <svg viewBox="-2 -2 104 104" class="logo-svg">
        <path
          d="${pathData}"
          fill="none"
          class="bg-path"
          stroke-width="1"
          fill-rule="evenodd"
        />
        <path
          class="trace-line"
          d="${pathData}"
          fill="none"
          stroke-width="1.5"
          fill-rule="evenodd"
        />
      </svg>
    </div>
    <div class="status-code">${status}</div>
    <h1 class="error-title">${title}</h1>
    <p class="error-description">${description}</p>
    <div class="button-group">
      <a href="${clientUrl}" class="btn btn-primary">Ir a SigmaBuilder</a>
    </div>
  </div>
</body>
</html>`;
};

module.exports = {
  renderErrorPage
};
