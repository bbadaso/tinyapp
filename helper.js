const bcrypt = require('bcrypt');


const emailLookup = (emailToCheck,users) =>{
  console.log("users ->",users)
  console.log("emails ->",emailToCheck)
  for (let userId in users) {
    if (users[userId].email === emailToCheck) {

      return userId;
    }
  }

  return false;
};
const passwordLookup = (passwordToCheck,users) =>{
  for (let user in users) {

    // if (users[user].password === passwordToCheck) {
      if (bcrypt.compareSync(passwordToCheck,users[user].password)) { 
    
      return true;
    }
  }
  return false;
};
const urlsForUser = (id,urlDatabase) =>{
  let urlsForID = {};
   
  for (let randomID in  urlDatabase) {
    console.log("the shortURL in urls",randomID);
    if (urlDatabase[randomID].userID === id) {
      urlsForID[randomID] = urlDatabase[randomID];
    }

  }

  console.log(id,"urls for user function",urlsForID);
  return urlsForID;
};
module.exports = { emailLookup, passwordLookup, urlsForUser};