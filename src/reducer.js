import { Map, List, Record } from 'immutable';
import { trim, camelCase, isEmpty } from 'lodash';
import invariant from 'invariant';

import {
  REGISTER_FORM,
  UNREGISTER_FORM,
  ATTACH_TO_FORM,
  DETACH_FROM_FORM,
  CHANGE,
  BLUR,
  TOUCH,
  SUBMIT_REQUEST,
  SUBMIT_SUCCESS,
  SUBMIT_FAILURE,
  VALIDATION_REQUEST,
  VALIDATION_NO_ERRORS,
  VALIDATION_ERRORS,
} from './constants';
import * as validationFunctions from './validators';


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
 * Parse the object with async validator functions.
 *
 * @param  {object} validators
 * @return {List<AsyncValidator>}
 */
export const parseAsyncValidators = (validators) =>
  List(Object.keys(validators)).map((name) => new AsyncValidator({ name }));

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
 * Field
 */

export const fieldNeedsValidation = (field, changedFieldName) => field.set(
  'needsValidation',
  changedFieldName === field.name ||
  field.get('syncValidators').map(
    validator => validator.get('params').some(param => param === changedFieldName)
  ).some(req => req)
);

export const Field = Record({
  name: '',
  value: '',
  syncValidators: List(),
  syncErrors: List(),
  asyncValidators: List(),
  asyncErrors: List(),
  serverErrors: List(),
  needsValidation: true,
  touched: false,
});
export const field = (state = new Field(), action) => {
  const { type, payload } = action;

  switch (type) {
    case ATTACH_TO_FORM: {
      const {
        name,
        initialValue,
        validationString,
        asyncValidators,
      } = payload;
      let newState = state;

      newState = newState.set('name', name);
      if (initialValue) {
        newState = newState.set('value', initialValue);
      }
      if (validationString) {
        newState = newState.set('syncValidators', parseSyncValidators(trim(validationString, '|')));
      }
      if (asyncValidators) {
        newState = newState.set('asyncValidators', parseAsyncValidators(asyncValidators));
      }
      return newState;
    }
    case BLUR:
      return state.set('touched', true);
    case TOUCH:
      // Mark as touched if no fields are specified or if it specifically
      // specified
      if (!payload.fields || payload.fields.includes(state.get('name'))) {
        return state.set('touched', true);
      }
      return state;
    case CHANGE: {
      state = state.set('value', payload.value); // eslint-disable-line no-param-reassign
      state = state.set('needsValidation', fieldNeedsValidation(state, action.name)); // eslint-disable-line no-param-reassign
      return state;
    }
    case SUBMIT_FAILURE:
      return state.set('syncErrors', List(payload.errors[state.get('name')]));
    case VALIDATION_REQUEST:
    case VALIDATION_NO_ERRORS:
    case VALIDATION_ERRORS:
      return state.set(
        'asyncValidators',
        state.get('asyncValidators').map(val => asyncValidator(val, action))
      );
    default:
      return state;
  }
};

/**
 * Form
 */

export const getFormData = (form) => form.get('fields').map(f => f.get('value'));

export const validateValue = (value, validators, formVals) => {
  const errors = [];

  validators.forEach(({ name, params }) => {
    // Confirm that the validator is recognized
    invariant(
      name in validationFunctions,
      `${name} validator is not recognized in validators.js`
    );

    if (!validationFunctions[name](value, params, formVals)) {
      errors.push(name);
    }
  });

  return errors;
};

export const validateField = (f, formVals) => f.set(
  'syncErrors',
  List(validateValue(f.get('value'), f.get('syncValidators'), formVals))
);

export const validateForm = (form) => form.set(
  'fields',
  form.fields.map(f => validateField(f, getFormData(form)))
);

export const Form = Record({
  id: '',
  fields: Map(),
  submitting: false,
});
export const form = (state = new Form(), action) => {
  const { type, payload } = action;

  switch (type) {
    case REGISTER_FORM:
      return state.set('id', payload);
    case ATTACH_TO_FORM: {
      state = state.setIn(['fields', payload.name], field(undefined, action)); // eslint-disable-line no-param-reassign
      state = validateForm(state); // eslint-disable-line no-param-reassign
      return state;
    }
    case DETACH_FROM_FORM:
      return state.removeIn(['fields', payload.name]);
    case TOUCH:
      return state.set('fields', state.get('fields').map(f => field(f, action)));
    case CHANGE: {
      state = state.set( // eslint-disable-line no-param-reassign
        'fields',
        state.get('fields').map(f => fieldNeedsValidation(f, payload.name))
      );
      state = state.setIn( // eslint-disable-line no-param-reassign
        ['fields', payload.name],
        field(state.getIn(['fields', payload.name]), action)
      );
      state = validateForm(state); // eslint-disable-line no-param-reassign
      return state;
    }
    case SUBMIT_REQUEST:
      return state.set('submitting', true);
    case SUBMIT_SUCCESS:
    case SUBMIT_FAILURE:
      return (state
        .set('submitting', false)
        .set('fields', state.get('fields').map(f => field(f, action)))
      );
    case BLUR:
    case VALIDATION_REQUEST:
    case VALIDATION_NO_ERRORS:
    case VALIDATION_ERRORS: {
      const newField = field(state.getIn(['fields', payload.name]), action);
      return state.setIn(['fields', payload.name], newField);
    }
    default:
      return state;
  }
};

/**
 * Forms
 */

export const forms = (state = new Map(), action) => {
  const { type, payload } = action;
  switch (type) {
    // Register form in reducer
    case REGISTER_FORM:
      return state.set(payload, form(undefined, action));
    case UNREGISTER_FORM:
      return state.remove(payload);
    // For everything else, just pass down to form
    case ATTACH_TO_FORM:
    case DETACH_FROM_FORM:
    case CHANGE:
    case BLUR:
    case TOUCH:
    case SUBMIT_REQUEST:
    case SUBMIT_SUCCESS:
    case SUBMIT_FAILURE:
    case VALIDATION_REQUEST:
    case VALIDATION_NO_ERRORS:
    case VALIDATION_ERRORS:
      return state.set(payload.id, form(state.get(payload.id), action));
    default:
      return state;
  }
};

export default forms;
