import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../model";

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

export const registerOrLogin = async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;
  try {
    const _user = await User.findOne({ email, password }).exec();

    if (_user) {
      const token = signToken(_user._id as unknown as string);
      return res.status(200).json({ token, email, id: _user._id });
    }

    const newUser = await User.create({ email, password });
    const token = signToken(newUser._id as unknown as string);
    return res
      .status(201)
      .json({ token, email: newUser.email, id: newUser._id });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
};
