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
  SUBMIT_FAILURE,
  VALIDATION_REQUEST,
  VALIDATION_NO_ERRORS,
  VALIDATION_ERRORS,
} from '../constants';


/**
 * Field
 */

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

      state = state.set('name', name); // eslint-disable-line no-param-reassign
      if (initialValue) {
        state = state.set('value', initialValue); // eslint-disable-line no-param-reassign
      }
      if (validationString) {
        state = state.set( // eslint-disable-line no-param-reassign
          'syncValidators',
          parseSyncValidators(trim(validationString, '|'))
        );
      }
      if (asyncValidators) {
        state = state.set( // eslint-disable-line no-param-reassign
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
      state = state.set('value', payload.value); // eslint-disable-line no-param-reassign
      state = fieldNeedsValidation(state, payload.name, payload.value); // eslint-disable-line no-param-reassign
      return state;
    }
    case SUBMIT_FAILURE:
      return state.set('syncErrors', List(payload.errors[state.get('name')]));
    case VALIDATION_REQUEST:
      state = state.set( // eslint-disable-line no-param-reassign
        'asyncValidators',
        state.get('asyncValidators').map(val => asyncValidator(val, action))
      );
      state = state.set( // eslint-disable-line no-param-reassign
        'asyncErrors',
        state.get('asyncErrors').remove(payload.validator)
      );
      // We've requested the errors, so this doesn't need validation again until
      // the value changes.
      state = state.set('needsValidation', false); // eslint-disable-line no-param-reassign
      return state;
    case VALIDATION_NO_ERRORS: {
      state = state.set( // eslint-disable-line no-param-reassign
        'asyncValidators',
        state.get('asyncValidators').map(val => asyncValidator(val, action))
      );
      state = state.set( // eslint-disable-line no-param-reassign
        'asyncErrors',
        state.get('asyncErrors').remove(payload.validator)
      );
      return state;
    }
    case VALIDATION_ERRORS: {
      state = state.set( // eslint-disable-line no-param-reassign
        'asyncValidators',
        state.get('asyncValidators').map(val => asyncValidator(val, action))
      );
      state = state.set( // eslint-disable-line no-param-reassign
        'asyncErrors',
        state.get('asyncErrors').add(payload.validator)
      );
      return state;
    }
    default:
      return state;
  }
};
