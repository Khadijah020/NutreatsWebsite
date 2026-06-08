import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors'
import connectDB from './configs/db.js'
import 'dotenv/config' 
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import addressRouter from './routes/addressRoute.js';
import categoryRouter from './routes/categoryRoute.js'
import customerRouter from './routes/customerRoute.js';
import aiRouter from './routes/aiRoute.js';
import analyticsRoute from './routes/analyticsRoute.js';


const app = express();
const port = process.env.PORT || 4000;

await connectDB()
await connectCloudinary()

//Allow multiple origins
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow localhost and 192.168.x.x networks
    if (origin.startsWith('http://localhost') || origin.startsWith('http://192.168.')) {
      return callback(null, true);
    }

    // Allow ngrok domains
    if (origin.includes('.ngrok-free.app') || origin.includes('.ngrok.io')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // ✅ Add this
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']  // ✅ Add this
};

//for debugging purpose only
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url} from ${req.headers.origin || 'no origin'}`);
  next();
});


//Middleware configuration
app.use(express.json());
app.use(cookieParser())
app.use(cors(corsOptions))

app.get('/', (req, res)=> res.send("API is working!"))
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)
app.use('/api/category', categoryRouter)
app.use('/api/customer', customerRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRoute);


app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`)
})