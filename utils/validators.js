exports.registerValidation = (userName, email, password) => {
  const errors = {};

  if (userName.trim() === "") {
    errors.userName = "Username cannot be empty";
  } else {
    const userNameRegex = /^[a-zA-Z0-9]{4,10}$/;
    if (!userNameRegex.test(userName)) {
      errors.userName = "User name should contain letters and numbers ony";
    }
  }

  if (email.trim() === "") {
    errors.email = "Email address cannot be empty";
  } else {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      errors.email = "Please provide a valid email address";
    }
  }

  if (password === "") {
    errors.password = "Password cannot be empty";
  } else {
    if (password.length < 6) {
      password.errors("Your password should be at least 6 characters long");
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

exports.loginValidation = (email, password) => {
  const errors = {};
  if (email.trim() === "") {
    errors.email = "Please provide an email address";
  } else {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      errors.email = "Please provide a valid email address";
    }
  }

  if (password === "") {
    errors.password = "Please enter your password to proceed";
  } else {
    if (password.length < 6) {
      password.errors = "Password should be at least 6 characters";
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
