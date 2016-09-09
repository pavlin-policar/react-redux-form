import { Record, List, Set } from 'immutable';
import { trim } from 'lodash';

import {
  asyncValidator,
  parseSyncValidators,
  parseAsyncValidators,
} from './validators';
import {
  ATTACH_TO_FORM,
  BLUR,
  TOUCH,
  CHANGE,
  SUBMIT_REQUEST,
  SUBMIT_FAILURE,
  VALIDATION_REQUEST,
  VALIDATION_NO_ERRORS,
  VALIDATION_ERRORS,
  CLEAR_FORM,
} from '../constants';


/**
 * Field
 */

 /* eslint-disable no-param-reassign */
export const fieldNeedsValidation = (field, name, value) => field.set(
  'needsValidation',
  (field.get('needsValidation')) ||
  (name === field.get('name') && value !== field.get('value')) ||
  field.get('syncValidators').map(
    validator => validator.get('params').some(param => param === name)
  ).some(req => req)
);

export const Field = Record({
  name: '',
  value: '',
  syncValidators: List(),
  syncErrors: Set(),
  asyncValidators: List(),
  asyncErrors: Set(),
  serverErrors: Set(),
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

      state = state.set('name', name);
      if (initialValue) {
        state = state.set('value', initialValue);
      }
      if (validationString) {
        state = state.set(
          'syncValidators',
          parseSyncValidators(trim(validationString, '|'))
        );
      }
      if (asyncValidators) {
        state = state.set(
          'asyncValidators',
          parseAsyncValidators(asyncValidators)
        );
      }
      return state;
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
      state = state.set('value', payload.value);
      state = fieldNeedsValidation(state, payload.name, payload.value);
      state = state.set('asyncErrors', state.get('asyncErrors').clear());
      state = state.set('serverErrors', state.get('serverErrors').clear());
      return state;
    }
    case SUBMIT_REQUEST:
      return state.set('serverErrors', state.get('serverErrors').clear());
    case SUBMIT_FAILURE:
      return state.set('serverErrors', Set(payload.errors[state.get('name')]));
    case VALIDATION_REQUEST:
      state = state.set(
        'asyncValidators',
        state.get('asyncValidators').map(val => asyncValidator(val, action))
      );
      state = state.set(
        'asyncErrors',
        state.get('asyncErrors').remove(payload.validator)
      );
      // We've requested the errors, so this doesn't need validation again until
      // the value changes.
      state = state.set('needsValidation', false);
      return state;
    case VALIDATION_NO_ERRORS: {
      state = state.set(
        'asyncValidators',
        state.get('asyncValidators').map(val => asyncValidator(val, action))
      );
      state = state.set(
        'asyncErrors',
        state.get('asyncErrors').remove(payload.validator)
      );
      return state;
    }
    case VALIDATION_ERRORS: {
      state = state.set(
        'asyncValidators',
        state.get('asyncValidators').map(val => asyncValidator(val, action))
      );
      state = state.set(
        'asyncErrors',
        state.get('asyncErrors').add(payload.validator)
      );
      return state;
    }
    case CLEAR_FORM: {
      if (
        payload && (
          (payload.fields instanceof Array && !payload.fields.includes(state.get('name'))) ||
          (typeof payload.fields === 'string' && payload.fields !== state.get('name'))
        )
      ) {
        return state;
      }
      state = state.set('value', '');
      state = state.set('serverErrors', state.get('serverErrors').clear());
      state = state.set('asyncErrors', state.get('asyncErrors').clear());
      state = state.set('syncErrors', state.get('syncErrors').clear());
      return state;
    }
    default:
      return state;
  }
};
