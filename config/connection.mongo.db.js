const { connect } = require("mongoose");

module.exports = async () => {
  try {
    // await connect(process.env.MONGO_DATABASE_CLOUD_URL);
    await connect(process.env.MONGO_DATABASE_CLOUD_URL);
    console.info("Connected To MongoDB ^_^");
  } catch (error) {
    console.error("Database Error: Connection Failed To MongoDB!", error);
  }
};
