require('dotenv').config();

const CryptoJS = require('crypto-js');


 const decryptFunction = (encryptedPassword) =>{
    const secretKey = process.env.SECRETKEY;
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedPassword;
}

module.exports = {decryptFunction}