import { Router } from 'express';
import {
  getContactsController,
  getContactsByIdController,
  createContactController,
  patchContactsByIdController,
  deleteContactsByIdController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createContactValidationSchema } from '../validation/createContactValidationSchema.js';
import { updateContactValidationSchema } from '../validation/updateContactValidationSchema.js';

import { isValidId } from '../middlewares/isValidId.js';

export const contactsRouter = Router();

contactsRouter.use('/:contactId', isValidId('contactId'));

contactsRouter.get('/', ctrlWrapper(getContactsController));

contactsRouter.get('/:contactId', ctrlWrapper(getContactsByIdController));

contactsRouter.post(
  '/',
  validateBody(createContactValidationSchema),
  ctrlWrapper(createContactController),
);

contactsRouter.patch(
  '/:contactId',
  validateBody(updateContactValidationSchema),
  ctrlWrapper(patchContactsByIdController),
);

contactsRouter.delete('/:contactId', ctrlWrapper(deleteContactsByIdController));
