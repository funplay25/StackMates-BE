const adminAuth = (req, res, next) => {
  const token = "abc";
  const isAuthorized = token === "abc";

  if (!isAuthorized) {
    res.status(401).send("you are not authorized bro");
  } else {
    next();
  }
};

const userAuth = (req, res, next) => {
  const token = "validser";
  const isAuthorized = token === "validUser";

  if (!isAuthorized) {
    res.status(401).send("first login you DUMBO 🤬");
  } else {
    next();
  }
};

module.exports = { adminAuth, userAuth };
