import crypto from 'crypto';

export const getPrivateKey = ({ userId, email, password }) => {
  const key1 = crypto
    .createHash('sha512')
    .update(password + email)
    .digest();
  const key2 = crypto
    .createHash('sha512')
    .update(userId + email)
    .digest();
  return key1 + key2;
};

export const getPublicKey = (privateKey, appletPrime, base) => {
  const key = crypto.createDiffieHellman(Buffer.from(appletPrime), Buffer.from(base));
  key.setPrivateKey(Buffer.from(privateKey));
  key.generateKeys();

  return key.getPublicKey();
};

export const getAESKey = (userPrivateKey, appletPublicKey, appletPrime, base) => {
  const key = crypto.createDiffieHellman(Buffer.from(appletPrime), Buffer.from(base));
  key.setPrivateKey(Buffer.from(userPrivateKey));

  const secretKey = key.computeSecret(Buffer.from(appletPublicKey));

  return crypto.createHash('sha256').update(secretKey).digest();
};

/** encrypt */
export const encryptData = ({ text, key }) => {
  let ivSize = 16;
  const iv = crypto.randomBytes(ivSize);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/** decrypt */
export const decryptData = ({ text, key }) => {
  let textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const encryptAndStringifyObject = (response, key) =>
  encryptData({ key, text: JSON.stringify(response) });

export const decryptAsJson = (text, key) => JSON.parse(decryptData({ text, key }));
