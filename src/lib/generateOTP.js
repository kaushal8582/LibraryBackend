const crypto = require("crypto")
 const generateOTP = (digit = 6)=>{

    let otp = "";

    for(let i=1; i<=digit;i++){
        otp += crypto.randomInt(0,10)
    }


    return otp


}

module.exports = generateOTP