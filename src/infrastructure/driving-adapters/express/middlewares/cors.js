const cors = require("cors");

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "").split(",");
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
