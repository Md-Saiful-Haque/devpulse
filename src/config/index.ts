import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env"),
  quiet: true
});

const config = {
  connection_string: process.env.CONNECTIONSTRING as string,
  port: process.env.PORT as string,
  node_env: process.env.NODE_ENV as string,
  jwt_secret: process.env.JWT_SECRET as string,
//   refresh_secret: process.env.JWT_REFRESH_SECRET
};

export default config;