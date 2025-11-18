/**
 * Helper script to test verification codes against a hash
 * 
 * Usage: node test-verification-code.js <hash> [code]
 * 
 * Example:
 *   node test-verification-code.js "$2b$10$FqpMchjQlSkw18SUAC9EVOMib9pwSBKrNdxvLpTz8CbfXkqQKYnKy" 123456
 */

const bcrypt = require('bcrypt');

const hash = process.argv[2];
const code = process.argv[3];

if (!hash) {
  console.error('Usage: node test-verification-code.js <hash> [code]');
  console.error('Example: node test-verification-code.js "$2b$10$..." 123456');
  process.exit(1);
}

if (code) {
  // Test a specific code
  bcrypt.compare(code, hash, (err, result) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    if (result) {
      console.log(`✅ Code "${code}" matches the hash!`);
    } else {
      console.log(`❌ Code "${code}" does NOT match the hash.`);
    }
  });
} else {
  // Try all possible 6-digit codes (000000 to 999999)
  // WARNING: This will take a very long time!
  console.log('⚠️  WARNING: Testing all 6-digit codes will take a very long time!');
  console.log('💡 Tip: Check your server console logs or register response for the code.');
  console.log('💡 Tip: Or provide a specific code to test: node test-verification-code.js <hash> <code>\n');
  
  console.log('Testing common codes first...');
  
  // Test some common patterns first
  const commonCodes = [
    '123456', '000000', '111111', '222222', '333333', '444444', '555555',
    '666666', '777777', '888888', '999999', '123123', '654321', '000001'
  ];
  
  let found = false;
  let tested = 0;
  
  const testCode = (testCode) => {
    bcrypt.compare(testCode, hash, (err, result) => {
      tested++;
      if (result) {
        console.log(`\n✅ FOUND! Code "${testCode}" matches the hash!`);
        found = true;
        process.exit(0);
      } else if (tested === commonCodes.length && !found) {
        console.log(`\n❌ None of the common codes matched.`);
        console.log('💡 The code is not a common pattern.');
        console.log('💡 Check your server console logs from when the user registered.');
        console.log('💡 Or check the register API response - it returns the verificationCode.');
        process.exit(1);
      }
    });
  };
  
  commonCodes.forEach(testCode);
}

