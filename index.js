require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connection, client } = require("./DB/MongoDB");
const { ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
connection();

//Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());
//Middleware

//Custom Middleware
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};
const verifyAdmin = async (req, res, next) => {
  const email = req.user.email;
  const user = await usersCollection.findOne({ email });
  if (!user || user.role !== "admin") {
    return res.status(403).send({ message: "Forbidden" });
  }
  next();
};
//Custom Middleware

//All Collection mealsCollection
const usersCollection = client.db("hostelManagement").collection("users");
const mealsCollection = client.db("hostelManagement").collection("meals");
//All Collection

//Create token use jwt
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ success: true });
});
app.post("/logout", async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ success: true });
});
//Create token use jwt

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

//get data from User Collection by role base
app.get("/user/role/:email", async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  if (user) {
    res.send(user.role);
  } else {
    res.status(404).send("User not found");
  }
});
//get data from User Collection by role base

// ===========Admin Related============
app.get("/admin/:email", verifyToken, verifyAdmin, async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  res.send(user);
});
app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  const users = await usersCollection.find().toArray();
  res.send(users);
});
app.patch("/users/role/:id", async (req, res) => {
  const id = req.params.id;
  const { role } = req.body;
  const updateDoc = {
    $set: { role: role },
  };
  const result = await usersCollection.updateOne(
    { _id: new ObjectId(id) },
    updateDoc
  );
  res.send(result);
});
app.post("/add-meals", verifyToken, verifyAdmin, async (req, res) => {
  const meal = req.body;
  const result = await mealsCollection.insertOne(meal);
  res.send(result);
});
app.get("/all-meals/:email", verifyToken, verifyAdmin, async (req, res) => {
  const email = req.params.email;
  const query = { "distributor.email": email };
  const meals = await mealsCollection.find(query).toArray();
  res.send(meals);
});
app.delete("/delete/meal/:id", verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const result = await mealsCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});
app.get("/view-meal/:id", verifyToken, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const meal = await mealsCollection.findOne({ _id: new ObjectId(id) });
  res.send(meal);
});
// ===========Admin Related============

// ===========User Related============
app.get("/user/:email", verifyToken, async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  res.send(user);
});
app.get("/all-meals", async (req, res) => {
  const category = req.query.category;
  if (category === "All Meals") {
    const meals = await mealsCollection.find().toArray();
    res.send(meals);
    return;
  }
  const filteredMeals = await mealsCollection
    .find({ category: category })
    .toArray();
  res.send(filteredMeals);
});
// ===========User Related============
app.get("/", (req, res) => {
  res.send("Hostel Management System is running");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
