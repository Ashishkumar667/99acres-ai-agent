
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import scraperRoutes from './routes/scraper.routes.js';
dotenv.config();



const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));


app.get('/', (req, res) => res.send('Real Estate Intelligence Backend is running'));

app.use('/api', scraperRoutes);

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => {
//     console.log("MongoDB connected");
// }).catch(err => {
//     console.error("MongoDB connection failed:", err);
// });

export default app;
