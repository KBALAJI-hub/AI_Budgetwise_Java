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
 origin:"http://localhost:3000",
 credentials:true
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

app.get("/auth/google", (req,res)=>{

 if(req.query.upload) {
  req.session.upload = true;
 } else {
  req.session.upload = false;
 }

 const scopes = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email"
 ];

 const url = oauth2Client.generateAuthUrl({
  access_type:"offline",
  scope:scopes,
  prompt:"consent"
 });

 res.redirect(url);

});

app.get("/auth/google/callback", async (req,res)=>{

 try{

  const { code } = req.query;

  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  req.session.googleTokens = tokens;

  if(req.session.upload){
   res.redirect("http://localhost:3000/upload-drive");
  } else {
   res.redirect("http://localhost:3000/dashboard");
  }

 }catch(err){

  console.log("Google OAuth Error:", err);

  res.redirect("http://localhost:3000/dashboard");

 }

});

app.get("/api/drive/upload", async (req,res)=>{

 const tokens = req.session.googleTokens;

 if(!tokens){
  return res.status(401).send("Not connected");
 }

 oauth2Client.setCredentials(tokens);

 const drive = google.drive({
  version:"v3",
  auth: oauth2Client
 });

 const fileMetadata = {
  name:"finance-backup.json"
 };

 const media = {
  mimeType:"application/json",
  body: JSON.stringify({ test:"finance data" })
 };

 const response = await drive.files.create({
  resource:fileMetadata,
  media:media,
  fields:"id"
 });

 res.json(response.data);

});

app.get("/api/drive/backup", authMiddleware, async (req,res)=>{

 const tokens = req.session.googleTokens;

 if(!tokens){
  return res.status(401).send("Not connected");
 }

 oauth2Client.setCredentials(tokens);

 const drive = google.drive({
  version:"v3",
  auth: oauth2Client
 });

 const data = {
  income: await prisma.transaction.findMany({ where: { type: 'INCOME', userId: req.userId } }),
  expenses: await prisma.transaction.findMany({ where: { type: 'EXPENSE', userId: req.userId } }),
  date: new Date()
 };

 const fileMetadata = {
  name:"finance-backup.json"
 };

 const media = {
  mimeType:"application/json",
  body: JSON.stringify(data)
 };

 const response = await drive.files.create({
  requestBody:fileMetadata,
  media:media,
  fields:"id"
 });

 res.json({success:true});

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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
