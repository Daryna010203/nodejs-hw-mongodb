import { readContacts } from '../utils/readContacts.js';
import { writeContacts } from '../utils/writeContacts.js';

export const removeLastContact = async () => {
  try {
    const updateContacts = await readContacts();
    if (updateContacts.length === 0) {
      return;
    }
    updateContacts.pop();
    await writeContacts(updateContacts);
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

removeLastContact();
