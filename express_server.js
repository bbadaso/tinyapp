const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const { emailLookup, passwordLookup, urlsForUser } = require('./helper');
const PORT = 8080; // default port 8080
let cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  secret: 'Barento',
  maxAge: 24 * 60 * 60 * 1000 
}));

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "124@g.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.set("view engine", "ejs");
const urlDatabase = {};
const generateRandomString = (longURL) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let individualURLS = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = { urls: individualURLS, greeting: "A URL Shortnening App by Barento Badaso", user: users[req.session.user_id] };
  
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };

  if (!users[req.session.user_id]) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let individualURLS = urlsForUser(req.session.user_id, urlDatabase)
 
  for (let shortenURL in individualURLS) {
    if (req.params.shortURL === shortenURL) {
      let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
      res.render("urls_show", templateVars);
      return;
    }
  }
  res.status(403).send("You don't have access to this URL")
  return;
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };

  res.render('registration', templateVars);
});

app.get("/", (req, res) => {
  res.redirect('/login');
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  //if cookies exist redirect to /urls otherwise /login 
  if (req.session.user_id) {
    res.redirect("/urls");
    return 
  } 
  res.render('login', templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let individualURLS = urlsForUser(req.session.user_id, urlDatabase)

  for (let shortenURL in individualURLS) {
    if (req.params.shortURL === shortenURL) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send("You don't have access to this URL")
  return;
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(req.body.longURL);

  urlDatabase[shortURL] = { "longURL": req.body.longURL, "userID": req.session.user_id };
  res.redirect(`/urls/${shortURL}`);      // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/update", (req, res) => {
  let individualURLS = urlsForUser(req.session.user_id, urlDatabase)

  for (let shortenURL in individualURLS) {
    if (req.params.shortURL === shortenURL) {
      urlDatabase[req.params.shortURL] = { 'longURL': req.body.longURL, "userID": req.session.user_id };
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send("You don't have access to this URL")
  return;
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls/new');
});

app.post("/login", (req, res) =>{
  let email = req.body.email;
  let password = req.body.password;
  let userId = emailLookup(email, users);

  if (!userId) {
    res.status(403).send("Invalid Email");
  } else if (userId && (passwordLookup(password, users)) === false) {
    res.status(403).send("Incorrect Password");
  } else if (userId && (passwordLookup(password, users))) {
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls/new');
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  let randomId = generateRandomString('id');

  if (email === '' || password === '') {
    res.status(400).send("Enter a valid Email and Password");
    return;
  } else if (emailLookup(email, users)) {
    res.status(400).send("This email is already registered");
    return;
  }
  users[randomId] = {
    id: randomId,
    email: email,
    password: password
  };
  req.session.user_id = randomId;
  res.redirect("/urls");
});

