import { Record, Set, Map } from 'immutable';
import invariant from 'invariant';

import {
  REGISTER_FORM,
  ATTACH_TO_FORM,
  DETACH_FROM_FORM,
  TOUCH,
  CHANGE,
  SUBMIT_REQUEST,
  SUBMIT_SUCCESS,
  SUBMIT_FAILURE,
  BLUR,
  VALIDATION_REQUEST,
  VALIDATION_NO_ERRORS,
  VALIDATION_ERRORS,
  CLEAR_FORM,
} from '../constants';
import * as validationFunctions from '../validators';
import { field, fieldNeedsValidation } from './field';


/**
 * Form
 */

export const getFormData = (form) => form.get('fields').map(f => f.get('value'));

/* eslint-disable no-param-reassign */
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
  Set(validateValue(f.get('value'), f.get('syncValidators'), formVals.toJS()))
);

export const validateForm = (form) => form.set(
  'fields',
  form.fields.map(f => validateField(f, getFormData(form)))
);

export const Form = Record({
  id: '',
  fields: Map(),
  errors: Set(),
  submitting: false,
});
export const form = (state = new Form(), action) => {
  const { type, payload } = action;

  switch (type) {
    case REGISTER_FORM:
      return state.set('id', payload);
    case ATTACH_TO_FORM: {
      state = state.setIn(['fields', payload.name], field(undefined, action));
      state = validateForm(state);
      return state;
    }
    case DETACH_FROM_FORM:
      return state.removeIn(['fields', payload.name]);
    case CHANGE: {
      state = state.set('errors', state.get('errors').clear());
      state = state.set(
        'fields',
        state.get('fields').map(f => fieldNeedsValidation(f, payload.name, payload.value))
      );
      state = state.setIn(
        ['fields', payload.name],
        field(state.getIn(['fields', payload.name]), action)
      );
      state = validateForm(state);
      return state;
    }
    case SUBMIT_REQUEST:
      state = state.set('submitting', true);
      return state;
    case SUBMIT_SUCCESS: {
      state = state.set('submitting', false);
      state = state.set('fields', state.get('fields').map(f => field(f, action)));
      return state;
    }
    case SUBMIT_FAILURE: {
      state = state.set('submitting', false);
      state = state.set('fields', state.get('fields').map(f => field(f, action)));
      state = state.set('errors', Set(payload.errors.form));
      return state;
    }
    // Change just one field specified by the `name`
    case BLUR:
    case VALIDATION_REQUEST:
    case VALIDATION_NO_ERRORS:
    case VALIDATION_ERRORS: {
      return state.setIn(
        ['fields', payload.name],
        field(state.getIn(['fields', payload.name]), action)
      );
    }
    // Map over all the fields
    case TOUCH:
    case CLEAR_FORM:
      return state.set('fields', state.get('fields').map(f => field(f, action)));
    default:
      return state;
  }
};
