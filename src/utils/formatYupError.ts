import { ValidationError } from 'yup';

export const formatYupError = (error: ValidationError) => {
    return error.inner.map(({ path, message }) => ({ path, message }));
};
