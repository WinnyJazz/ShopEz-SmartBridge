
require("dotenv").config();

const cloudinary = require("./config/cloudinary");

async function testCloudinary() {
  try {
    console.log("Cloud name configured:", Boolean(process.env.CLOUDINARY_CLOUD_NAME));
    console.log("API key configured:", Boolean(process.env.CLOUDINARY_API_KEY));
    console.log("API secret configured:", Boolean(process.env.CLOUDINARY_API_SECRET));

    const result = await cloudinary.api.ping();

    console.log("Cloudinary connection successful!");
    console.log("Status:", result.status);
  } catch (error) {
    console.error("Cloudinary connection failed.");
    console.error("Error object:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("HTTP status:", error?.http_code);
    console.error("Additional details:", error?.error);
    process.exitCode = 1;
  }
}

testCloudinary();
