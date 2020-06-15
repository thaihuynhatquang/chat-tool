import jwt from "jsonwebtoken";

class Signature {
  privateKe;
  algorithm;

  constructor() {
    this.privateKey = process.env.JWT_SECRET
      ? process.env.JWT_SECRET
      : "";
    this.algorithm = "HS256";
  }

  sign(text) {
    return jwt.sign(text, this.privateKey, { algorithm: this.algorithm });
  }

  // Note expireTimes: seconds
  signWithExpire(data, expireTime) {
    return jwt.sign(data, this.privateKey, {
      expiresIn: expireTime,
      algorithm: this.algorithm,
    });
  }

  verify(text) {
    return jwt.verify(text, this.privateKey);
  }

  decode(text) {
    return jwt.decode(text);
  }
}

export default new Signature();
