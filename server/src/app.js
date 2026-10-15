import express from "express"
import cors from "cors"
import apiRouter from './routes/api.js'

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS policy blocked access from: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.use('/api', apiRouter);

// Just to chek the runningness of my server
app.get('/health', (req, res) => {
  console.log("Health Route Endpoint Hit")
  res.status(200).json({
    status: 'success',
    message: 'Backend server is running smoothly',
  });
});

export default app;