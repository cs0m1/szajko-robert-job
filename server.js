const express = require('express');
const helmet = require('helmet');

const app = express();

// Configure security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        frameSrc: ["'self'", "https://maps.google.com", "https://*.google.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https://maps.gstatic.com",
          "https://*.fbcdn.net",
          "https://*.facebook.com"
        ],
        connectSrc: ["'self'", "https://maps.googleapis.com", "https://*.facebook.com"],
        fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  })
);

// Serve the static site from public/
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
