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

const app = express();

app.use(cors({
 origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"],
 credentials:true
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const { google } = require('googleapis');

app.get("/auth/google", (req, res) => {
 const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
 );

 const scopes = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid"
 ];

 const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: scopes
 });

 res.redirect(url);
});

app.get("/auth/google/callback", async (req,res)=>{
 const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
 );

 const { tokens } = await oauth2Client.getToken(req.query.code);
 oauth2Client.setCredentials(tokens);

 req.session = req.session || {};
 req.session.googleTokens = tokens;

 res.redirect("/dashboard");
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

  res.json({
   success:true,
   user
  });

 }catch(err){
  res.status(500).json({message:"Login error"});
 }

});

app.get("/api/dashboard", async (req,res)=>{
 const income = await prisma.transaction.findMany({ where: { type: 'INCOME' } });
 const expenses = await prisma.transaction.findMany({ where: { type: 'EXPENSE' } });

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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
