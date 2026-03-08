import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["Assets/**/*"],
      manifest: {
        name: "🎁 КОРОБОЧКА 5.0",
        short_name: "КОРОБОЧКА",
        description: "Планировщик задач с таймером",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#fffaf0",
        theme_color: "#5d4037",
        orientation: "portrait-primary",
        icons: [
          {
            src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiBmaWxsPSIjZmZmYWYwIi8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ4LCA0OCkiPgo8cmVjdCB4PSIwIiB5PSI0OCIgd2lkdGg9Ijk2IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRkZENTRGIiBzdHJva2U9IiM1ZDQwMzciIHN0cm9rZS13aWR0aD0iMiIgcng9IjgiLz4KPHBhdGggZD0iTTAgNDhMMjQgMzJMNDggNDhMMjQgNDgiIGZpbGw9IiNGRkE3MjciIHN0cm9rZT0iIzVkNDAzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik00OCA0OEw3MiAzMkw5NiA0OEw3MiA0OCIgZmlsbD0iI0ZGQjc0RiIgc3Ryb2tlPSIjZmZmYWYwIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9nPgo8L3N2Zz4=",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiBmaWxsPSIjNWQ0MDM3Ii8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQ4LCA0OCkiPgo8cmVjdCB4PSIwIiB5PSI0OCIgd2lkdGg9Ijk2IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRkZENTRGIiBzdHJva2U9IiNmZmZhZjAiIHN0cm9rZS13aWR0aD0iMiIgcng9IjgiLz4KPHBhdGggZD0iTTAgNDhMMjQgMzJMNDggNDhMMjQgNDgiIGZpbGw9IiNGRkE3MjciIHN0cm9rZT0iI2ZmZmFmMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Ik00OCA0OEw3MiAzMkw5NiA0OEw3MiA0OCIgZmlsbD0iI0ZGQjc0RiIgc3Ryb2tlPSIjZmZmYWYwIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9nPgo8L3N2Zz4=",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "maskable",
          },
          {
            src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjZmZmYWYwIi8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyOCwgMTI4KSI+CjxyZWN0IHg9IjAiIHk9IjEyOCIgd2lkdGg9IjI1NiIgaGVpZ2h0PSIxNzAiIGZpbGw9IiNGRkQ1NEYiIHN0cm9rZT0iIzVkNDAzNyIgc3Ryb2tlLXdpZHRoPSI0IiBjeD0iMTI4IiBjeT0iMTkyIi8+CjxwYXRoIGQ9Ik0gMCAxMjggTCA2NCAxMDAgTCAyNTYgMTI4IiBmaWxsPSIjRkZBNzI3IiBzdHJva2U9IiM1ZDQwMzciIHN0cm9rZS13aWR0aD0iNCIvPgo8L2c+Cjwvc3ZnPg==",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSIjNWQ0MDM3Ii8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyOCwgMTI4KSI+CjxyZWN0IHg9IjAiIHk9IjEyOCIgd2lkdGg9IjI1NiIgaGVpZ2h0PSIxNzAiIGZpbGw9IiNGRkQ1NEYiIHN0cm9rZT0iI2ZmZmFmMCIgc3Ryb2tlLXdpZHRoPSI0IiBjeD0iMTI4IiBjeT0iMTkyIi8+CjxwYXRoIGQ9Ik0gMCAxMjggTCA2NCAxMDAgTCAyNTYgMTI4IiBmaWxsPSIjRkZBNzI3IiBzdHJva2U9IiNmZmZhZjAiIHN0cm9rZS13aWR0aD0iNCIvPgo8L2c+Cjwvc3ZnPg==",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-css",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/Assets\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "asset-images",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  server: {
    host: "::",
    port: 8080,
  },
});
