const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName) {
    throw new Error("Please enter firstname");
  } else if (!lastName) {
    throw new Error("Please enter lastname");
  } else if (firstName.length < 3 || firstName.length > 10) {
    throw new Error("First name must be between 3 and 10 characters long");
  } else if (lastName.length < 3 || lastName.length > 10) {
    throw new Error("Last name must be between 3 and 10 characters long");
  } else if (!validator.isEmail(email)) {
    throw new Error("Please enter a valid email address");
  } else if (!validator.isStrongPassword(password, { minLength: 6 })) {
    if (password.length < 6) {
      throw new Error("Password must be 6 or more characters long");
    } else {
      throw new Error(
        "Password is too weak — try adding more variety (numbers, symbols, uppercase/lowercase)",
      );
    }
  }
};

module.exports = validateSignUpData;
