import mongoose from "mongoose";

declare module "mongoose" {
  namespace Types {
    interface ObjectIdConstructor {
      isValid(id: string): boolean;
    }
  }
}
