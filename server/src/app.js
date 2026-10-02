import express from "express"
import cors from "cors"


const app = express()

app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));


// Just to chek the runningness of my server
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend server is running smoothly',
  });
});

export default app;