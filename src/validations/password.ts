import * as yup from 'yup';
import { passwordMinLength } from '../modules/register/errorMessages';

export const passwordSchema = yup
    .string()
    .min(3, passwordMinLength)
    .max(255);
