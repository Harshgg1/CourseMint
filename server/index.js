const express = require('express');

const cors = require('cors');
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");


const app = express();
app.use(express.json())
app.use(cors());
app.use(express.json());

app.use("/admin", adminRouter)
app.use("/user", userRouter)

mongoose.connect('mongodb+srv://hhggleet_db_user:rIap4Oj0qti82geA@cluster0.p9ldwm3.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" });

app.listen(3000, () => console.log('Server running on port 3000'));
