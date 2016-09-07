import { Record, List } from 'immutable';
import { camelCase, isEmpty } from 'lodash';

import {
  VALIDATION_REQUEST,
  VALIDATION_NO_ERRORS,
  VALIDATION_ERRORS,
} from '../constants';

/**
 * Sync validator
 */

export const SyncValidator = Record({
  name: '',
  params: [],
});
export const syncValidator = (state = new SyncValidator(), action) => {
  const { type } = action;

  switch (type) {
    default:
      return state;
  }
};

/**
 * Parse the validation string passed down from props.
 *
 * @param {string} validationString
 * @return {List<SyncValidator>}
 */
export const parseSyncValidators = (validationString) => {
  // Parse validators, remove duplicates
  const strValidators = Object.keys(
    validationString
      .split('|')
      .reduce((acc, el) => (el ? { ...acc, [el]: null } : acc), {})
  );
  return List(strValidators).map((strValidator) => {
    let name = strValidator;
    let params = [];

    // Parameters are separated from the validation with a colon
    if (strValidator.indexOf(':') > 0) {
      [name, ...params] = strValidator.split(':');

      // Multiple parameters may be delimited by a comma
      if (params[0].indexOf(',') > -1) {
        params = params[0].split(',');
      }
    }
    // Validator names don't have to be camel case, they can be delimited by
    // dashes
    name = camelCase(name);
    // Replace any empty string parameters with undefined, to deal with
    // params in format validate:,param
    params = params.map((el) => (isEmpty(el) ? undefined : el));

    return new SyncValidator({ name, params });
  });
};


/**
 * Async validator
 */

export const AsyncValidator = Record({
  name: '',
  isValidating: false,
});
export const asyncValidator = (state = new AsyncValidator(), action) => {
  const { type, payload } = action;
  // Check if the validator matches payload validator name
  if (state.get('name') !== payload.validator) {
    return state;
  }
  switch (type) {
    case VALIDATION_REQUEST:
      return state.set('isValidating', true);
    case VALIDATION_NO_ERRORS:
    case VALIDATION_ERRORS:
      return state.set('isValidating', false);
    default:
      return state;
  }
};

/**
 * Parse the object with async validator functions.
 *
 * @param  {object} validators
 * @return {List<AsyncValidator>}
 */
export const parseAsyncValidators = (validators) =>
  List(Object.keys(validators)).map((name) => new AsyncValidator({ name }));
