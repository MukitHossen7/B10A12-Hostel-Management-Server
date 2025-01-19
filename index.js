require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const stripe = require("stripe")(process.env.PAYMENT_SECTET_KEY);

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
const premiumsCollection = client.db("hostelManagement").collection("premiums");
const paymentCollection = client.db("hostelManagement").collection("payments");
const reviewCollection = client.db("hostelManagement").collection("reviews");
const requestMealCollection = client
  .db("hostelManagement")
  .collection("requestMeals");
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

//Create payment Intent
app.post("/create-payment-intent", verifyToken, async (req, res) => {
  const { price } = req.body;
  const amount = price * 100;
  const { client_secret } = await stripe.paymentIntents.create({
    amount: amount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // res.send({ clientSecret: response.client_secret });
  res.send(client_secret);
});
app.post("/payment-info", verifyToken, async (req, res) => {
  const payment = req.body;
  const result = await paymentCollection.insertOne(payment);
  res.send(result);
});
// ===========Admin Related============
app.get("/admin/:email", verifyToken, verifyAdmin, async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  res.send(user);
});
app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  const query = req.query.search;
  if (query) {
    const searchUser = await usersCollection
      .find({
        $or: [
          {
            email: { $regex: query, $options: "i" },
          },
          {
            displayName: { $regex: query, $options: "i" },
          },
        ],
      })
      .toArray();
    res.send(searchUser);
    return;
  }

  const users = await usersCollection.find().toArray();
  res.send(users);
});

// app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
//   try {
//     const query = req.query.search?.trim(); // Trim to handle unnecessary spaces
//     let users;

//     if (query) {
//       // Sanitize the input
//       const regex = new RegExp(query, "i"); // Create a case-insensitive regex
//       users = await usersCollection
//         .find({
//           $or: [
//             { email: { $regex: regex } },
//             { displayName: { $regex: regex } },
//           ],
//         })
//         .toArray();
//     } else {
//       users = await usersCollection.find().toArray();
//     }

//     res.status(200).send(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// });

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
app.get("/all-meals-admin", verifyToken, verifyAdmin, async (req, res) => {
  const meals = await mealsCollection.find().toArray();
  const mealsWithAverageRating = meals.map((meal) => {
    const ratings = meal.rating || [];
    const totalRating = ratings.reduce((acc, rate) => acc + rate, 0);
    const averageRating =
      ratings.length > 0 ? (totalRating / ratings.length).toFixed(1) : 0;
    return {
      ...meal,
      averageRating: parseFloat(averageRating),
    };
  });
  res.send(mealsWithAverageRating);
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
app.get("/get-admin-reviews", verifyToken, verifyAdmin, async (req, res) => {
  const reviews = await reviewCollection.find().toArray();
  res.send(reviews);
});
app.get("/all-serves", verifyToken, verifyAdmin, async (req, res) => {
  const query = req.query.search;
  if (query) {
    const searchUser = await requestMealCollection
      .find({
        $or: [
          {
            "customer.email": { $regex: query, $options: "i" },
          },
          {
            "customer.name": { $regex: query, $options: "i" },
          },
        ],
      })
      .toArray();
    res.send(searchUser);
    return;
  }
  const serves = await requestMealCollection.find().toArray();
  res.send(serves);
});
app.patch(
  "/all-serves/status/:id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    const updateDoc = {
      $set: { status: status },
    };
    const result = await requestMealCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );
    res.send(result);
  }
);
app.patch(
  "/all-meals/updata/:id",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    const id = req.params.id;
    const meal = req.body;
    const updateDoc = {
      $set: {
        title: meal.title,
        price: meal.price,
        description: meal.description,
        category: meal.category,
        postTime: meal.postTime,
        ingredients: meal.ingredients,
        image: meal.image,
      },
    };
    const result = await mealsCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );
    res.send(result);
  }
);
// ===========Admin Related============

// ===========User Related============
app.get("/user/:email", verifyToken, async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  res.send(user);
});
app.get("/all-meals", async (req, res) => {
  const category = req.query.category;
  const meals =
    category === "All Meals"
      ? await mealsCollection.find().toArray()
      : await mealsCollection.find({ category }).toArray();

  const mealsWithAverageRating = meals.map((meal) => {
    const ratings = meal.rating || [];
    const totalRating = ratings.reduce((acc, rate) => acc + rate, 0);
    const averageRating =
      ratings.length > 0 ? (totalRating / ratings.length).toFixed(1) : 0;
    return {
      ...meal,
      averageRating: parseFloat(averageRating),
    };
  });

  res.send(mealsWithAverageRating);
  // res.send(filteredMeals);
});
app.get("/meal-details/:id", async (req, res) => {
  const id = req.params.id;
  const meal = await mealsCollection.findOne({ _id: new ObjectId(id) });
  const ratings = meal.rating.map((rating) => rating) || [];
  const ratingReduce = ratings.reduce((acc, rating) => acc + rating, 0);
  const averageRating =
    ratings.length > 0 ? Math.floor(ratingReduce / ratings.length) : 0;
  const mealWithRating = { ...meal, averageRating };
  res.send({ meal: mealWithRating });
});
app.patch("/update-like/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };

  const updateDoc = {
    $inc: { likes: 1 },
  };
  const result = await mealsCollection.updateOne(filter, updateDoc);
  res.send(result);
});

// app.patch("/update-reviews/:id", async (req, res) => {
//   const review = req.body;
//   const id = req.params.id;
//   const filter = { _id: new ObjectId(id) };
//   const updateDoc = {
//     $push: { reviews: review },
//   };

//   const result = await mealsCollection.updateOne(filter, updateDoc);
//   res.send(result);
// });

app.get("/check-subscription/:email", async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  res.send(user);
});
app.get("/all-premiums", async (req, res) => {
  const premiums = await premiumsCollection.find().toArray();
  res.send(premiums);
});
app.get("/all-premiums/:package", verifyToken, async (req, res) => {
  const packageType = req.params.package;
  const premiums = await premiumsCollection.findOne({ name: packageType });
  res.send(premiums);
});
app.patch("/update-based", verifyToken, async (req, res) => {
  const { email, packageType } = req.body;
  const filter = { email: email };
  const updateDoc = {
    $set: { badge: packageType },
  };
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);
});
app.post("/request-meal", verifyToken, async (req, res) => {
  const requestMeal = req.body;
  const result = await requestMealCollection.insertOne(requestMeal);
  res.send(result);
});
app.get("/meal/requested/:email", verifyToken, async (req, res) => {
  const email = req.params.email;
  const requestedMeals = await requestMealCollection
    .find({ "customer.email": email })
    .toArray();
  res.send(requestedMeals);
});
app.get("/payment/history/:email", verifyToken, async (req, res) => {
  const email = req.params.email;
  const paymentHistory = await paymentCollection
    .find({ "customer.email": email })
    .toArray();
  res.send(paymentHistory);
});
app.post("/reviews", verifyToken, async (req, res) => {
  const review = req.body;
  const result = await reviewCollection.insertOne(review);
  res.send(result);
});
app.get("/reviews/:id", async (req, res) => {
  const id = req.params.id;
  const reviews = await reviewCollection.find({ foodId: id }).toArray();
  res.send(reviews);
});
app.patch("/update-reviews/:id", verifyToken, async (req, res) => {
  const { status } = req.body;
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  let updateDoc;
  if (status === "inc") {
    updateDoc = {
      $inc: { reviews: 1 },
    };
  }
  const result = await mealsCollection.updateOne(filter, updateDoc);
  res.send(result);
});
app.get("/reviews/user/:email", verifyToken, async (req, res) => {
  const email = req.params.email;
  const reviews = await reviewCollection
    .find({ "customer.email": email })
    .toArray();
  res.send(reviews);
});
app.delete("/request-meal/cancel/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const result = await requestMealCollection.deleteOne({
    _id: new ObjectId(id),
  });
  res.send(result);
});
app.get("/api/meals", async (req, res) => {
  const { search, category } = req.query;
  let filter = {};
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }
  if (category) {
    filter.category = category;
  }
  const meals = await mealsCollection.find(filter).toArray();
  res.send(meals);
});
app.patch("/update-rating/:id", verifyToken, async (req, res) => {
  const { rating } = req.body;
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $push: { rating: rating },
  };
  const result = await mealsCollection.updateOne(filter, updateDoc);
  res.send(result);
});
// ===========User Related============
app.get("/", (req, res) => {
  res.send("Hostel Management System is running");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
