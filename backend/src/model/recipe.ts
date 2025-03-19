import { Schema, model, SchemaTypes } from "mongoose";

// Interface for the Image subdocument
interface IImage {
  url: string;
  id: string;
}

// Interface representing a Recipe document in MongoDB
interface IRecipe {
  title: string;
  description: string;
  note: string;
  ingredients: string[]; // Changed to array of strings
  instructions: string[]; // Added for step-by-step instructions
  prepTime: string; // e.g., "15 minutes"
  cookTime: string; // e.g., "30 minutes"
  servings: number; // e.g., 4
  image: IImage;
  user?: string; // Optional reference to User
  createdAt?: Date; // Provided by timestamps
  updatedAt?: Date; // Provided by timestamps
}

// Create a Schema corresponding to the IRecipe interface
const recipeSchema = new Schema<IRecipe>(
  {
    user: {
      type: SchemaTypes.ObjectId,
      ref: "User", // Reference to User model
      required: false, // Optional field
    },
    title: {
      type: String,
      required: [true, "Recipe title is required"],
      index: true,
      trim: true, // Removes leading/trailing whitespace
    },
    description: {
      type: String,
      required: [true, "Recipe description is required"],
      index: true,
      trim: true,
    },
    note: {
      type: String,
      required: false,
      index: true,
      trim: true,
    },
    ingredients: {
      type: [String], // Array of strings for individual ingredients
      required: [true, "Ingredients are required"],
      index: true,
    },
    instructions: {
      type: [String], // Array of strings for step-by-step instructions
      required: [true, "Instructions are required"],
    },
    prepTime: {
      type: String,
      required: [true, "Preparation time is required"],
    },
    cookTime: {
      type: String,
      required: [true, "Cooking time is required"],
    },
    servings: {
      type: Number,
      required: [true, "Number of servings is required"],
      min: [1, "Servings must be at least 1"],
    },
    image: {
      url: {
        type: String,
        required: [true, "Image URL is required"],
      },
      id: {
        type: String,
        required: [true, "Image ID is required"],
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    autoIndex: true, // Automatically creates indexes for indexed fields
    toJSON: { virtuals: true }, // Includes virtuals in JSON output
    toObject: { virtuals: true }, // Includes virtuals in object output
  }
);

// Optional: Add a virtual field (e.g., total time)
recipeSchema.virtual("totalTime").get(function () {
  // Simple calculation assuming prepTime and cookTime are strings like "15 minutes"
  const prep = parseInt(this.prepTime) || 0;
  const cook = parseInt(this.cookTime) || 0;
  return `${prep + cook} minutes`;
});

// Create and export the Model
export const Recipe = model<IRecipe>("Recipe", recipeSchema);
