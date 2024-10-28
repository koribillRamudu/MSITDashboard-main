// src/utils.js
import axios from 'axios';

export const fetchClasses = async () => {
  const response = await axios.get('https://bvsrauoaua.execute-api.ap-south-1.amazonaws.com/getClasses', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = JSON.parse(response.data.body);
  return data.folders;
};

export const encryptEmail = (email) => {
  let encryptedEmail = '';
  for (let i = 0; i < email.length; i++) {
    let charCode = email.charCodeAt(i);
    charCode = ((charCode - 32 + 26) % 95) + 32; // Ensure the characters wrap around
    encryptedEmail += String.fromCharCode(charCode);
  }
  return encryptedEmail;
};
