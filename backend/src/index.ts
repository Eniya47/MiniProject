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
        title: "Beef Tacos",
        description:
          "Flavorful beef tacos with fresh toppings and warm tortillas.",
        note: "Add a squeeze of lime for extra zing.",
        ingredients: [
          "500g ground beef",
          "1 tbsp taco seasoning",
          "8 soft tortillas",
          "1 cup shredded lettuce",
          "1 tomato, diced",
          "1/2 cup shredded cheddar cheese",
          "2 tbsp olive oil",
          "1/4 cup sour cream",
          "Fresh cilantro for garnish",
        ],
        instructions: [
          "Heat olive oil in a skillet, add ground beef, and cook until browned.",
          "Stir in taco seasoning and 1/4 cup water, simmer for 5 minutes.",
          "Warm tortillas in a dry pan or microwave.",
          "Assemble tacos with beef, lettuce, tomato, cheese, sour cream, and cilantro.",
          "Serve immediately.",
        ],
        prepTime: "10 minutes",
        cookTime: "15 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "beeftacos123",
        },
        user: user._id,
      },
      {
        title: "Lentil Soup",
        description:
          "A hearty and nutritious soup packed with lentils and veggies.",
        note: "Great with crusty bread on the side.",
        ingredients: [
          "1 cup dried green lentils",
          "1 onion, chopped",
          "2 carrots, diced",
          "2 celery stalks, sliced",
          "2 cloves garlic, minced",
          "1 can (400g) diced tomatoes",
          "4 cups vegetable broth",
          "1 tsp cumin",
          "2 tbsp olive oil",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Heat olive oil in a pot, sauté onion, garlic, carrots, and celery until soft.",
          "Add cumin, stir for 30 seconds, then add lentils, tomatoes, and broth.",
          "Bring to a boil, then simmer for 35-40 minutes until lentils are tender.",
          "Season with salt and pepper, serve hot.",
        ],
        prepTime: "15 minutes",
        cookTime: "40 minutes",
        servings: 6,
        image: {
          url: "https://picsum.photos/200/300",
          id: "lentilsoup123",
        },
        user: user._id,
      },
      {
        title: "Grilled Salmon with Lemon Herb Sauce",
        description:
          "Juicy grilled salmon with a tangy lemon and herb topping.",
        note: "Works well with asparagus or roasted potatoes.",
        ingredients: [
          "4 salmon fillets (150g each)",
          "2 tbsp olive oil",
          "1 lemon, juiced and zested",
          "2 cloves garlic, minced",
          "1 tbsp fresh dill, chopped",
          "1 tbsp fresh parsley, chopped",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Preheat grill to medium-high heat.",
          "Brush salmon with olive oil, season with salt and pepper.",
          "Grill salmon for 4-5 minutes per side until cooked through.",
          "Mix lemon juice, zest, garlic, dill, and parsley to make sauce.",
          "Drizzle sauce over salmon and serve.",
        ],
        prepTime: "10 minutes",
        cookTime: "10 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "grilledsalmon123",
        },
        user: user._id,
      },
      {
        title: "Blueberry Muffins",
        description: "Fluffy muffins bursting with fresh blueberries.",
        note: "Best enjoyed warm with a pat of butter.",
        ingredients: [
          "2 cups all-purpose flour",
          "1 cup sugar",
          "1/2 cup unsalted butter, melted",
          "2 large eggs",
          "1 cup milk",
          "1 tbsp baking powder",
          "1 tsp vanilla extract",
          "1 1/2 cups fresh blueberries",
          "Pinch of salt",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C) and line a muffin tin with paper liners.",
          "Mix flour, sugar, baking powder, and salt in a bowl.",
          "Whisk eggs, milk, butter, and vanilla in another bowl.",
          "Combine wet and dry ingredients, then fold in blueberries.",
          "Fill muffin cups 3/4 full and bake for 20-25 minutes.",
        ],
        prepTime: "15 minutes",
        cookTime: "25 minutes",
        servings: 12,
        image: {
          url: "https://picsum.photos/200/300",
          id: "blueberrymuffins123",
        },
        user: user._id,
      },
      {
        title: "Shakshuka",
        description:
          "A Middle Eastern dish of poached eggs in a spicy tomato sauce.",
        note: "Serve with pita bread for dipping.",
        ingredients: [
          "4 large eggs",
          "1 can (400g) crushed tomatoes",
          "1 red bell pepper, diced",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 tsp cumin",
          "1 tsp paprika",
          "2 tbsp olive oil",
          "Salt and pepper to taste",
          "Fresh parsley for garnish",
        ],
        instructions: [
          "Heat olive oil in a skillet, sauté onion, garlic, and bell pepper until soft.",
          "Add cumin and paprika, cook for 1 minute, then stir in tomatoes.",
          "Simmer for 10 minutes, then make 4 wells and crack eggs into them.",
          "Cover and cook for 5-7 minutes until eggs are set.",
          "Season and garnish with parsley.",
        ],
        prepTime: "10 minutes",
        cookTime: "20 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "shakshuka123",
        },
        user: user._id,
      },
      {
        title: "Pesto Pasta",
        description: "A simple yet flavorful pasta with homemade basil pesto.",
        note: "Top with extra Parmesan for richness.",
        ingredients: [
          "300g penne pasta",
          "2 cups fresh basil leaves",
          "1/2 cup pine nuts",
          "1/2 cup Parmesan cheese, grated",
          "2 cloves garlic",
          "1/2 cup olive oil",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Cook pasta in salted boiling water until al dente, then drain.",
          "Blend basil, pine nuts, Parmesan, garlic, and olive oil into a pesto.",
          "Toss pasta with pesto, season with salt and pepper.",
          "Serve warm.",
        ],
        prepTime: "10 minutes",
        cookTime: "15 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "pestopasta123",
        },
        user: user._id,
      },
      {
        title: "Roasted Vegetable Quinoa Bowl",
        description:
          "A healthy bowl with roasted veggies and protein-packed quinoa.",
        note: "Drizzle with tahini for extra creaminess.",
        ingredients: [
          "1 cup quinoa",
          "1 zucchini, sliced",
          "1 sweet potato, cubed",
          "1 red onion, wedged",
          "2 tbsp olive oil",
          "1 tsp smoked paprika",
          "Salt and pepper to taste",
          "2 cups water or broth",
          "Fresh parsley for garnish",
        ],
        instructions: [
          "Preheat oven to 400°F (200°C).",
          "Toss veggies with olive oil, paprika, salt, and pepper, roast for 25 minutes.",
          "Cook quinoa in water or broth for 15 minutes until fluffy.",
          "Assemble bowls with quinoa and roasted veggies, garnish with parsley.",
        ],
        prepTime: "15 minutes",
        cookTime: "25 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "quinoabowl123",
        },
        user: user._id,
      },
      {
        title: "Banana Bread",
        description:
          "Moist and sweet banana bread perfect for breakfast or a snack.",
        note: "Add walnuts or chocolate chips for variety.",
        ingredients: [
          "3 ripe bananas, mashed",
          "1/2 cup unsalted butter, melted",
          "3/4 cup sugar",
          "2 large eggs",
          "1 tsp vanilla extract",
          "1 1/2 cups all-purpose flour",
          "1 tsp baking soda",
          "Pinch of salt",
        ],
        instructions: [
          "Preheat oven to 350°F (175°C) and grease a loaf pan.",
          "Mix mashed bananas, butter, sugar, eggs, and vanilla.",
          "Stir in flour, baking soda, and salt until just combined.",
          "Pour into loaf pan and bake for 60 minutes.",
          "Cool before slicing.",
        ],
        prepTime: "15 minutes",
        cookTime: "60 minutes",
        servings: 8,
        image: {
          url: "https://picsum.photos/200/300",
          id: "bananabread123",
        },
        user: user._id,
      },
      {
        title: "Lamb Kofta",
        description: "Spiced lamb skewers grilled to perfection.",
        note: "Serve with tzatziki and pita bread.",
        ingredients: [
          "500g ground lamb",
          "1 onion, grated",
          "2 cloves garlic, minced",
          "1 tsp cumin",
          "1 tsp coriander",
          "1/2 tsp cinnamon",
          "2 tbsp fresh mint, chopped",
          "Salt and pepper to taste",
          "Skewers",
        ],
        instructions: [
          "Mix lamb, onion, garlic, spices, mint, salt, and pepper in a bowl.",
          "Shape mixture around skewers into logs.",
          "Preheat grill to medium-high, cook kofta for 8-10 minutes, turning occasionally.",
          "Serve hot.",
        ],
        prepTime: "20 minutes",
        cookTime: "10 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "lambkofta123",
        },
        user: user._id,
      },
      {
        title: "Mushroom Risotto",
        description: "Creamy risotto with earthy mushrooms and Parmesan.",
        note: "Use Arborio rice for the best texture.",
        ingredients: [
          "1 cup Arborio rice",
          "200g mushrooms, sliced",
          "1 onion, finely chopped",
          "2 cloves garlic, minced",
          "4 cups chicken or vegetable broth",
          "1/2 cup white wine",
          "1/2 cup Parmesan, grated",
          "2 tbsp butter",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Heat broth in a pot and keep warm.",
          "In a pan, melt butter, sauté onion and garlic, then add mushrooms.",
          "Add rice, stir for 1 minute, then pour in wine and cook until absorbed.",
          "Add broth 1 ladle at a time, stirring until absorbed, for 20 minutes.",
          "Stir in Parmesan, season, and serve.",
        ],
        prepTime: "10 minutes",
        cookTime: "30 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "mushroomrisotto123",
        },
        user: user._id,
      },
      {
        title: "Caprese Salad",
        description:
          "A fresh Italian salad with tomatoes, mozzarella, and basil.",
        note: "Use high-quality balsamic vinegar for drizzling.",
        ingredients: [
          "4 ripe tomatoes, sliced",
          "200g fresh mozzarella, sliced",
          "1 cup fresh basil leaves",
          "2 tbsp olive oil",
          "1 tbsp balsamic vinegar",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Arrange tomato and mozzarella slices on a plate, alternating with basil leaves.",
          "Drizzle with olive oil and balsamic vinegar.",
          "Season with salt and pepper, serve immediately.",
        ],
        prepTime: "10 minutes",
        cookTime: "0 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "capresesalad123",
        },
        user: user._id,
      },
      {
        title: "Pork Stir-Fry with Pineapple",
        description:
          "A sweet and savory stir-fry with tender pork and juicy pineapple.",
        note: "Great with jasmine rice.",
        ingredients: [
          "400g pork tenderloin, sliced",
          "1 cup pineapple chunks",
          "1 red bell pepper, sliced",
          "1 onion, sliced",
          "2 tbsp soy sauce",
          "1 tbsp hoisin sauce",
          "1 tbsp cornstarch",
          "2 tbsp vegetable oil",
          "1 tsp ginger, minced",
        ],
        instructions: [
          "Toss pork with cornstarch, soy sauce, and hoisin sauce.",
          "Heat oil in a wok, stir-fry pork until browned, then remove.",
          "Add ginger, bell pepper, and onion, stir-fry for 3 minutes.",
          "Return pork to wok, add pineapple, and cook for 2 more minutes.",
          "Serve hot.",
        ],
        prepTime: "15 minutes",
        cookTime: "15 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "porkstirfry123",
        },
        user: user._id,
      },
      {
        title: "Apple Crisp",
        description:
          "A warm dessert with tender apples and a crunchy oat topping.",
        note: "Serve with a scoop of vanilla ice cream.",
        ingredients: [
          "4 apples, peeled and sliced",
          "1/2 cup brown sugar",
          "1/2 cup all-purpose flour",
          "1/2 cup rolled oats",
          "1 tsp cinnamon",
          "1/4 cup unsalted butter, softened",
          "Pinch of salt",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "Place apples in a baking dish, sprinkle with half the cinnamon.",
          "Mix flour, oats, sugar, remaining cinnamon, salt, and butter into crumbs.",
          "Spread topping over apples, bake for 35-40 minutes until golden.",
          "Serve warm.",
        ],
        prepTime: "15 minutes",
        cookTime: "40 minutes",
        servings: 6,
        image: {
          url: "https://picsum.photos/200/300",
          id: "applecrisp123",
        },
        user: user._id,
      },
      {
        title: "Thai Green Curry",
        description: "A fragrant and spicy curry with chicken and vegetables.",
        note: "Adjust chili paste to taste.",
        ingredients: [
          "500g chicken thighs, sliced",
          "1 can (400ml) coconut milk",
          "2 tbsp green curry paste",
          "1 cup bamboo shoots",
          "1 red bell pepper, sliced",
          "2 tbsp fish sauce",
          "1 tbsp sugar",
          "2 tbsp vegetable oil",
          "Fresh Thai basil for garnish",
        ],
        instructions: [
          "Heat oil in a pan, cook curry paste for 1 minute.",
          "Add chicken, stir-fry until browned, then pour in coconut milk.",
          "Add bamboo shoots, bell pepper, fish sauce, and sugar, simmer for 15 minutes.",
          "Garnish with Thai basil and serve.",
        ],
        prepTime: "15 minutes",
        cookTime: "20 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "thaigreencurry123",
        },
        user: user._id,
      },
      {
        title: "Stuffed Bell Peppers",
        description: "Bell peppers filled with a savory beef and rice mixture.",
        note: "Top with extra cheese before baking.",
        ingredients: [
          "4 large bell peppers, tops removed",
          "400g ground beef",
          "1 cup cooked rice",
          "1 can (400g) tomato sauce",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 cup shredded mozzarella",
          "2 tbsp olive oil",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "Heat oil, sauté onion and garlic, then add beef and cook until browned.",
          "Stir in rice, half the tomato sauce, salt, and pepper.",
          "Stuff peppers with mixture, place in a dish, and pour remaining sauce over.",
          "Bake for 35-40 minutes, top with cheese, and bake 5 more minutes.",
        ],
        prepTime: "20 minutes",
        cookTime: "45 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "stuffedpeppers123",
        },
        user: user._id,
      },
      {
        title: "Lemon Garlic Shrimp",
        description: "Quick and zesty shrimp sautéed with garlic and lemon.",
        note: "Perfect over pasta or with crusty bread.",
        ingredients: [
          "400g shrimp, peeled and deveined",
          "3 cloves garlic, minced",
          "1 lemon, juiced and zested",
          "2 tbsp olive oil",
          "1 tbsp butter",
          "1/4 tsp red pepper flakes",
          "Salt and pepper to taste",
          "Fresh parsley for garnish",
        ],
        instructions: [
          "Heat olive oil and butter in a skillet over medium heat.",
          "Add garlic and red pepper flakes, sauté for 30 seconds.",
          "Add shrimp, cook for 2-3 minutes per side until pink.",
          "Stir in lemon juice and zest, season with salt and pepper.",
          "Garnish with parsley and serve.",
        ],
        prepTime: "10 minutes",
        cookTime: "10 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "lemongarlicshrimp123",
        },
        user: user._id,
      },
      {
        title: "Pumpkin Soup",
        description: "A creamy and comforting soup made with fresh pumpkin.",
        note: "Add a swirl of cream for presentation.",
        ingredients: [
          "1 kg pumpkin, peeled and cubed",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "4 cups vegetable broth",
          "1/2 cup heavy cream",
          "2 tbsp olive oil",
          "1 tsp nutmeg",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Heat olive oil in a pot, sauté onion and garlic until soft.",
          "Add pumpkin and broth, bring to a boil, then simmer for 20 minutes.",
          "Blend until smooth, stir in cream and nutmeg.",
          "Season with salt and pepper, serve warm.",
        ],
        prepTime: "15 minutes",
        cookTime: "25 minutes",
        servings: 6,
        image: {
          url: "https://picsum.photos/200/300",
          id: "pumpkinsoup123",
        },
        user: user._id,
      },
      {
        title: "Chicken Parmesan",
        description:
          "Crispy breaded chicken topped with marinara and melted cheese.",
        note: "Serve with spaghetti for a classic meal.",
        ingredients: [
          "4 chicken breasts",
          "1 cup breadcrumbs",
          "1/2 cup Parmesan, grated",
          "1 egg, beaten",
          "1 cup marinara sauce",
          "1 cup mozzarella, shredded",
          "2 tbsp olive oil",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Preheat oven to 400°F (200°C).",
          "Season chicken with salt and pepper, dip in egg, then coat with breadcrumbs and Parmesan.",
          "Heat oil in a skillet, brown chicken on both sides.",
          "Place chicken in a baking dish, top with marinara and mozzarella.",
          "Bake for 20 minutes until cheese is melted and chicken is cooked.",
        ],
        prepTime: "15 minutes",
        cookTime: "30 minutes",
        servings: 4,
        image: {
          url: "https://picsum.photos/200/300",
          id: "chickenparmesan123",
        },
        user: user._id,
      },
      {
        title: "Berry Smoothie",
        description: "A refreshing and healthy smoothie with mixed berries.",
        note: "Add a scoop of protein powder for a boost.",
        ingredients: [
          "1 cup mixed berries (strawberries, blueberries, raspberries)",
          "1 banana",
          "1 cup Greek yogurt",
          "1/2 cup almond milk",
          "1 tbsp honey",
          "Ice cubes (optional)",
        ],
        instructions: [
          "Blend all ingredients until smooth.",
          "Add ice cubes if desired and blend again.",
          "Pour into glasses and serve immediately.",
        ],
        prepTime: "5 minutes",
        cookTime: "0 minutes",
        servings: 2,
        image: {
          url: "https://picsum.photos/200/300",
          id: "berrysmoothie123",
        },
        user: user._id,
      },
      {
        title: "Eggplant Parmesan",
        description:
          "A vegetarian twist on the classic with crispy eggplant slices.",
        note: "Layer with extra sauce for moisture.",
        ingredients: [
          "2 large eggplants, sliced",
          "1 cup breadcrumbs",
          "1/2 cup Parmesan, grated",
          "2 eggs, beaten",
          "2 cups marinara sauce",
          "1 1/2 cups mozzarella, shredded",
          "2 tbsp olive oil",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "Dip eggplant slices in egg, then coat with breadcrumbs and Parmesan.",
          "Heat oil in a skillet, fry eggplant until golden, then drain.",
          "Layer eggplant, marinara, and mozzarella in a baking dish.",
          "Bake for 25-30 minutes until bubbly and golden.",
        ],
        prepTime: "20 minutes",
        cookTime: "30 minutes",
        servings: 6,
        image: {
          url: "https://picsum.photos/200/300",
          id: "eggplantparmesan123",
        },
        user: user._id,
      },
    ];

    for (const recipe of sampleRecipes) {
      const existingRecipe = await Recipe.findOne({ title: recipe.title });
      if (!existingRecipe) {
        await Recipe.create(recipe);
        console.log(`Inserted: ${recipe.title}`);
      } else {
        console.log(`Recipe already exists: ${recipe.title}`);
      }
    }
  } else {
    console.log("User not found.");
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
