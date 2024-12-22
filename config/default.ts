import dotenv from "dotenv-safe";

dotenv.config();

export default {
  environment: {
    clarifai: process.env.CLARIFAI_API || '',
    port: Number(String(process.env.PORT)) || 1337,
  },
  dbConfig: {
    url: process.env.DBURL || "",
    saltWorkFactor: Number(String(process.env.SALTWORKFACTOR)) || 10,
  },
};