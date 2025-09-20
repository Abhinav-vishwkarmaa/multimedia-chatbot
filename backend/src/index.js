import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { create, all } from 'mathjs';
import authRoutes from './routes/auth.js'
import cors from 'cors';
import helmet from 'helmet';
dotenv.config();
const app = express();
const port = process.env.PORT || 3010;
const router = express.Router();
app.use(router);
router.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        // Keep defaults, but allow API calls to your backend
        "connect-src": ["'self'", "http://localhost:3010"],
      },
    },
  })
);
router.use(cors({ origin: '*' }));
router.use(bodyParser.json());

router.use('/api', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});