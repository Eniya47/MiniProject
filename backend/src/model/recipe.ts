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
  note?: string; // Optional as per frontend
  ingredients: string; // Changed to string to match frontend TextArea
  instructions?: string[]; // Optional since not in frontend
  prepTime?: string; // Optional since not in frontend
  cookTime?: string; // Optional since not in frontend
  servings?: number; // Optional since not in frontend
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
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Recipe description is required"],
      index: true,
      trim: true,
    },
    note: {
      type: String,
      required: false, // Optional as per frontend
      index: true,
      trim: true,
    },
    ingredients: {
      type: String, // Changed to String to match frontend TextArea
      required: [true, "Ingredients are required"],
      index: true,
      trim: true,
    },
    instructions: {
      type: [String], // Still an array, but optional
      required: false, // Not collected in frontend
    },
    prepTime: {
      type: String,
      required: false, // Not collected in frontend
    },
    cookTime: {
      type: String,
      required: false, // Not collected in frontend
    },
    servings: {
      type: Number,
      required: false, // Not collected in frontend
      min: [1, "Servings must be at least 1"], // Constraint applies if provided
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
    timestamps: true,
    autoIndex: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Optional: Add a virtual field (e.g., total time)
recipeSchema.virtual("totalTime").get(function () {
  // Only calculate if prepTime and cookTime are provided
  const prep = this.prepTime ? parseInt(this.prepTime) || 0 : 0;
  const cook = this.cookTime ? parseInt(this.cookTime) || 0 : 0;
  return prep + cook > 0 ? `${prep + cook} minutes` : "Not specified";
});

// Create and export the Model
export const Recipe = model<IRecipe>("Recipe", recipeSchema);
