import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env"),
  quiet: true
});

const config = {
  connection_string: process.env.CONNECTIONSTRING as string,
  port: process.env.PORT,
  node_env: process.env.NODE_ENV,
//   secret: process.env.JWT_SECRET,
//   refresh_secret: process.env.JWT_REFRESH_SECRET
};

export default config;