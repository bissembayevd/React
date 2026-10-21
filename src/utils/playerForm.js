import { PLAYER_COUNTRIES } from '../data/countries.js';

// Form values stay strings until validation; blank numbers must not become zero.
export function validatePlayerForm(values, roles) {
  const errors = {};
  for (const field of ['nickname', 'firstName', 'lastName', 'nationality']) {
    if (!values[field].trim()) errors[field] = 'This field is required.';
    else if (values[field].trim().length > 80) errors[field] = 'Use 80 characters or fewer.';
  }
  if (values.nationality.trim() && !PLAYER_COUNTRIES.includes(values.nationality.trim())) errors.nationality = 'Choose a nationality from the list.';
  if (!values.age.trim()) errors.age = 'Age is required.';
  else if (!Number.isInteger(Number(values.age)) || Number(values.age) < 16 || Number(values.age) > 45) errors.age = 'Enter a whole-number age from 16 to 45.';
  if (!roles.includes(values.role)) errors.role = 'Choose a role.';
  if (!values.rating.trim()) errors.rating = 'Rating is required.';
  else if (!Number.isFinite(Number(values.rating)) || Number(values.rating) < 0 || Number(values.rating) > 3) errors.rating = 'Enter a rating from 0 to 3.';
  return errors;
}

export function toPlayerData(values) {
  return { nickname: values.nickname.trim(), firstName: values.firstName.trim(), lastName: values.lastName.trim(), nationality: values.nationality.trim(), age: Number(values.age), role: values.role, rating: Number(values.rating), status: 'free-agent', teamId: null };
}
