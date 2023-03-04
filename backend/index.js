const bodyParser = require("body-parser");
const express = require("express");
const dbConnect = require("./config/dbConnect");
const { errorHandler, notFound } = require("./middelweares/ErrorHandler");
const app = express();
const dotenv =require("dotenv").config();
const PORT = process.env.PORT || 4000;
const authRouter=require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const categoryRouter = require("./routes/prodCategoryRoute");
const blogcategoryRouter = require("./routes/blogCatRoute");
const brandRouter = require("./routes/brandRoute");
const uploadRouter = require("./routes/uploadRoute");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");


dbConnect();
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use("/api/user", authRouter);
app.use("/api/product", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/upload", uploadRouter);


app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
console.log(`Server is running  at PORT ${PORT}`);

})
