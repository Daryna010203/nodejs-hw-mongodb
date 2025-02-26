import { ContactsCollection } from '../db/models/contacts.js';

const createPaginationMetadata = (page, perPage, count) => {
  const totalPages = Math.ceil(count / perPage);
  const hasPreviousPage = page !== 1 && page <= totalPages + 1;
  const hasNextPage = count > page * perPage;

  return {
    page,
    perPage,
    totalItems: count,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  };
};

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  filter,
  userId,
}) => {
  const offset = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find({ userId });

  if (filter && typeof filter.isFavourite === 'boolean') {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  const contactQuery = ContactsCollection.find()
    .merge(contactsQuery)
    .skip(offset)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder });

  const contactsCountQuery = ContactsCollection.find()
    .merge(contactsQuery)
    .countDocuments();

  const [contacts, contactsCount] = await Promise.all([
    contactQuery,
    contactsCountQuery,
  ]);

  const paginationMetadata = createPaginationMetadata(
    page,
    perPage,
    contactsCount,
  );

  return { data: contacts, ...paginationMetadata };
};

export const getContactById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOne({
    _id: contactId,
    userId,
  });
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const patchContactById = async (contactId, userId, payload, options) => {
  const contact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );
  if (!contact || !contact.value) return null;

  return {
    contact: contact.value,
    isNew: Boolean(contact?.lastErrorObject?.upserted),
  };
};

export const deleteContactById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId,
  });
  return contact;
};
