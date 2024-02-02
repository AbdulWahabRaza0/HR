window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: "/api-json", // Replace with the route to your Swagger JSON data
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: "StandaloneLayout",
  });
};

