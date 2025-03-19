import { Strategy, ExtractJwt } from "passport-jwt";
import { PassportStatic } from "passport";
import { User } from "../model";
import dotenv from "dotenv";
dotenv.config();
// console.log(process.env.JWT_SECRET);

let options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey:
    "0f10e012f2b974953aee29ab724fc90740110efc23f70a9651935b869c6798b9",
};

export const authenticate = (passport: PassportStatic) => {
  passport.use(
    new Strategy(options, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
          return done(null, user?._id);
        }
        return done(null, false);
      } catch (err) {
        console.log(err);
      }
    })
  );
};
