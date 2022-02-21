const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

//Google Auth
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "855422851464-fpg7m63pkojvt3gknjrratt4bqicqqcp.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

//Middleware
app.use(express.json());
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  let token = req.body.token;
  console.log(token);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    console.log(payload);
  }
  verify()
    .then(() => {
      res.cookie("session-token", token);
      res.send("succes");
    })
    .catch(console.error);
});
app.get("/dashboard", checkAuthenticated, (req, res) => {
  let user = req.user;
  res.render("dashboard", { user });
});
app.get("/protectedroute", checkAuthenticated, (req, res) => {
  res.render("protectedroute.ejs");
});
app.get("/logout", (req, res) => {
  res.clearCookie("session-token");
  res.redirect("/login");
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
function checkAuthenticated(req, res, next) {
  let token = req.cookies["session-token"];
  let user = {};
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    user.name = payload.name;
    user.email = payload.email;
    user.picture = payload.picture;
  }
  verify()
    .then(() => {
      req.user = user;
      next();
    })
    .catch((err) => {
      res.redirect("/login");
    });
}
