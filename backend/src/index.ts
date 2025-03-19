import * as dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import { connect } from "mongoose";
import passport from "passport";
import cors from "cors";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
//@ts-ignore
import xssClean from "xss-clean";

import { authRouter, recipeRouter } from "./routes";
import { authenticate } from "./config";
import { User } from "./model/user";
import { Recipe } from "./model";
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const app: Application = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors());

//set http headers
app.use(helmet());
//compress the node application
app.use(compression());
//serve as a limiter for accessing our api
app.use(apiLimiter);
//clean againt injections
app.use(xssClean());

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
  })
);

app.use(passport.initialize());

// Passport Config
authenticate(passport);

//initialize DB call
import mongoose from "mongoose";

const runDB = async () => {
  mongoose.set("strictQuery", true);
  await connect(process.env.MONGODB_URI as string).then(() =>
    console.log("DB connected successfully")
  );
  // .catch(() => console.log("DB not connected"));
};

// Insert sample users
const insertSampleUsers = async () => {
  const sampleUsers = [
    { email: "user1@example.com", password: "password123" },
    { email: "user2@example.com", password: "password456" },
  ];

  for (const user of sampleUsers) {
    const existingUser = await User.findOne({ email: user.email });
    if (!existingUser) {
      await User.create(user);
      console.log(`Inserted: ${user.email}`);
    }
  }
};

// Insert sample recipes
const insertSampleRecipes = async () => {
  const user = await User.findOne({ email: "user1@example.com" });
  if (user) {
    const sampleRecipes = [
      {
        title: "Spaghetti Bolognese",
        description: "Classic Italian pasta dish.",
        note: "Use fresh basil for better flavor.",
        ingredients: "Spaghetti, minced beef, tomato sauce, garlic, onion",
        image: {
          url: "https://example.com/spaghetti.jpg",
          id: "spaghetti123",
        },
        user: user._id,
      },
      {
        title: "Chicken Curry",
        description: "Spicy and flavorful chicken curry.",
        note: "Serve with steamed rice.",
        ingredients: "Chicken, curry powder, coconut milk, onion, garlic",
        image: {
          url: "https://example.com/chicken-curry.jpg",
          id: "chickencurry123",
        },
        user: user._id,
      },
    ];

    for (const recipe of sampleRecipes) {
      const existingRecipe = await Recipe.findOne({ title: recipe.title });
      if (!existingRecipe) {
        await Recipe.create(recipe);
        console.log(`Inserted: ${recipe.title}`);
      }
    }
  }
};

// Start DB and insert samples
runDB().then(() => {
  insertSampleUsers().then(() => insertSampleRecipes());
});

app.use("/recipe", recipeRouter);
app.use("/auth", authRouter);

//OPTIONAL (THIS IS JUST FOR HEALTH CHECK MAJORLY)
//added for pinging and health check on render.com
app.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});
app.all("*", async (req: Request, res: Response) => {
  console.log(req.protocol);
  res.status(404).json({
    error: "The route you requested is not found",
  });
});

const PORT = (process.env.PORT as unknown as number) || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
