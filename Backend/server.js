const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const cors = require("cors")
const connectDb = require("./config/db")

const app = express()

// Connect to Database
connectDb()


app.use(cors())
app.use(express.json())


const authRouter = require("./routes/authRoutes")
const chatRouter = require("./routes/chatRoutes")
const orderRouter = require("./routes/orderRoutes")

app.use("/api/auth", authRouter)
app.use("/api/chat", chatRouter)
app.use("/api/orders", orderRouter)

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
