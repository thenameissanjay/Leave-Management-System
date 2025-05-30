// import bcrypt from 'bcryptjs';
const bcrypt = require('bcryptjs');
const hashGenerate = async  (decryptedPassword) =>{
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(decryptedPassword, saltRounds);
    return hashedPassword;
}

module.exports = {hashGenerate}
