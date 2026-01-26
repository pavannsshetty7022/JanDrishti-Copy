import bcrypt from "bcrypt";

const password = "Pk@7022302564";

bcrypt.hash(password, 10).then(hash => {
  console.log(hash);
});
