// types/express.d.ts
import { IUser } from "../types/user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
