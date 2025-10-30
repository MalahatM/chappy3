import express from "express";

	 

 const app = express();
//middleware to parse json
app.use(express.json());

//routes

 console.log("Users route loaded"); 


//for debugging
 app.use((req, res, next) => {
console.log(`Received request: ${req.method} ${req.url}`);
 next();
 });
//start server
const PORT = process.env.PORT ;
 console.log(" Server starting...");
 app.listen(PORT, () => {   console.log(` Server is running on http://localhost:${PORT}`);
     });