import { PATH_DB } from '../constants/contacts.js';
import fs from 'node:fs';

export const writeContacts = async (updatedContacts) => {
  try {
    const data = JSON.stringify(updatedContacts);
    await fs.promises.writeFile(PATH_DB, data, 'utf-8');
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};
