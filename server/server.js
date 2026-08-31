require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const savingsRoutes = require('./routes/savingsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const exportRoutes = require('./routes/exportRoutes');
const backupRoutes = require('./routes/backupRoutes');
const forumRoutes = require('./routes/forumRoutes');
const googleRoutes = require('./routes/googleRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const session = require('express-session');

app.use(session({
 secret:"finance-secret",
 resave:false,
 saveUninitialized:false,
 cookie:{
  secure:false,
  httpOnly:true,
  sameSite:"lax"
 }
}));

const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
 process.env.GOOGLE_CLIENT_ID,
 process.env.GOOGLE_CLIENT_SECRET,
 "http://localhost:5000/auth/google/callback"
);

const authMiddleware = require('./middleware/authMiddleware');

app.get("/auth/google", (req, res) => {
  const userId = req.session?.user?.id;
  const jwtSecret = process.env.JWT_SECRET || 'secret';
  const jwt = require('jsonwebtoken');
  
  if (!userId) {
    const token = req.query.token;
    if (token) {
      return res.redirect(`/api/google/auth?token=${token}`);
    }
    return res.redirect(`${FRONTEND_URL}/login`);
  }
  
  const token = jwt.sign({ id: userId }, jwtSecret);
  res.redirect(`/api/google/auth?token=${token}`);
});

app.get("/auth/google/callback", (req, res) => {
  const { code, state } = req.query;
  res.redirect(`/api/google/callback?code=${code}&state=${state}`);
});

app.get("/api/drive/upload", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { uploadFile, isConfigured } = require('./services/googleDriveService');
    const configured = await isConfigured(userId);
    if (!configured) {
      return res.status(401).send("Not connected");
    }
    const fileData = await uploadFile(userId, "finance-backup.json", Buffer.from(JSON.stringify({ test: "finance data" })), "application/json");
    res.json(fileData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed: " + err.message);
  }
});

app.get("/api/drive/backup", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { getOAuth2ClientForUser } = require('./services/googleDriveService');
    const client = await getOAuth2ClientForUser(userId);
    const drive = google.drive({
      version: "v3",
      auth: client
    });

    const data = {
      income: await prisma.transaction.findMany({ where: { type: 'INCOME', userId: userId } }),
      expenses: await prisma.transaction.findMany({ where: { type: 'EXPENSE', userId: userId } }),
      date: new Date()
    };

    const fileMetadata = {
      name: "finance-backup.json"
    };

    const media = {
      mimeType: "application/json",
      body: JSON.stringify(data)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id"
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.post("/api/login", async (req,res)=>{

 try{

  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if(!user){
   return res.status(401).json({message:"User not found"});
  }

  if(user.password !== password){
   return res.status(401).json({message:"Invalid password"});
  }

  req.session = req.session || {};
  req.session.user = {
   id: user.id,
   email: user.email
  };

  res.json({
   success:true,
   user
  });

 }catch(err){
  res.status(500).json({message:"Login error"});
 }

});


app.get("/api/dashboard", authMiddleware, async (req,res)=>{

 const income = await prisma.transaction.findMany({
  where: { type: 'INCOME', userId: req.userId }
 });
 const expenses = await prisma.transaction.findMany({
  where: { type: 'EXPENSE', userId: req.userId }
 });

 const totalIncome = income.reduce((sum,i)=>sum+i.amount,0);
 const totalExpense = expenses.reduce((sum,e)=>sum+e.amount,0);

 res.json({
  income,
  expenses,
  totalIncome,
  totalExpense
 });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
