require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connection, client } = require("./DB/MongoDB");
const app = express();
const port = process.env.PORT || 5000;
connection();
//Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

//All Collection
const usersCollection = client.db("hostelManagement").collection("users");
//All Collection

//Save all Users Data in Users Collection
app.post("/users", async (req, res) => {
  const user = req.body;
  const existUsers = await usersCollection.findOne({ email: user.email });
  if (existUsers) {
    return res.send("User already exist");
  }
  const result = await usersCollection.insertOne(user);
  res.send(result);
});
//Save all Users Data in Users Collection
app.get("/", (req, res) => {
  res.send("Hostel Management System is running");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
