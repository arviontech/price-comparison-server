import mongoose from "mongoose";
import config from "./app/config";
import app from "./app";

const main = async () => {
  try {
    const server = await mongoose.connect(config.database_url as string);
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

main();
