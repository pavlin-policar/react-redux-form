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
  RECEIVE_VALIDATION_ERRORS,
} from './constants';
import * as validators from './validators';


/**
 * Data types
 */

const FieldRecord = Record({
  name: '',
  value: '',
  validators: List(),
  errors: List(),
  needsValidation: true,
  touched: false,
  validating: false,
});
export class Field extends FieldRecord {
  isValid() { return this.get('errors').isEmpty(); }

  setNeedsValidation({ name }) {
    const needsValidation = this.validators.map(
      val => val.params.some(param => param === name)
    ).some(req => req) || name === this.name;
    return this.set('needsValidation', needsValidation);
  }
}

const FormRecord = Record({
  fields: Map(),
  submitting: false,
});
export class Form extends FormRecord {
  getData() { return this.fields.map(f => f.get('value')); }
  getErrors() { return this.fields.map(f => f.get('errors')); }

  /**
   * Parse the validation string passed down from props and return an object
   * containing data to execute the validator.
   *
   * @return {array}
   * @private
   */
  static parseValidators(validationString) {
    // Parse validators, remove duplicates, include default validators
    const strValidators = Object.keys(
      validationString.split('|')
        .reduce((acc, el) => (el ? { ...acc, [el]: null } : acc), {})
    );
    return strValidators.map((strValidator) => {
      let validator = strValidator;
      let params = [];

      // Parameters are separated from the validation with a colon
      if (strValidator.indexOf(':') > 0) {
        [validator, ...params] = strValidator.split(':');

        // Multiple parameters may be delimited by a comma
        if (params[0].indexOf(',') > -1) {
          params = params[0].split(',');
        }
      }
      validator = camelCase(validator);
      // Replace any empty string parameters with undefined
      params = params.map((el) => (isEmpty(el) ? undefined : el));

      return { validator, params };
    });
  }

  validateValue(value, validatorsParams) {
    const errors = [];

    validatorsParams.forEach(({ validator, params }) => {
      // Confirm that the validator is recognized
      invariant(
        validator in validators,
        `${validator} validator is not recognized in validators.js`
      );

      if (!value || !validators[validator](value, params, this.getData().toJS())) {
        errors.push(validator);
      }
    });

    return errors;
  }

  validate() {
    return this.set('fields', this.fields.map((f) => {
      if (f.get('needsValidation')) {
        return f.set(
          'errors',
          List(this.validateValue(f.get('value'), f.get('validators')))
        ).set('needsValidation', false);
      }
      return f;
    }));
  }

  isValid() { return this.fields.map(f => f.isValid()).every(f => f === true); }
}

/**
 * Reducers
 */

export const field = (state = new Field(), action) => {
  const { type, payload } = action;

  switch (type) {
    case ATTACH_TO_FORM:
      return (state
        .set('validators', Form.parseValidators(trim(payload.validationString, '|')))
        .set('value', payload.initialValue || state.get('value'))
        .set('name', payload.name)
      );
    case BLUR:
      return state.set('touched', true);
    case TOUCH:
      if (payload.fields.includes(state.get('name'))) {
        return state.set('touched', true);
      }
      return state;
    case CHANGE:
      return state.set('value', payload.value).setNeedsValidation(payload);
    case SUBMIT_FAILURE: {
      const { errors } = payload;
      return state.set('errors', List(errors[state.get('name')]));
    }
    case VALIDATION_REQUEST:
      return state.set('validating', true);
    case RECEIVE_VALIDATION_ERRORS: {
      // Extract the error names from the error response
      const errorNames = payload.errors ? Object.keys(payload.errors) : [];
      return (state
        .set('validating', false)
        .set('errors', state.get('errors').push(...errorNames))
      );
    }
    default:
      return state;
  }
};

export const form = (state = new Form(), action) => {
  const { type, payload } = action;

  switch (type) {
    case ATTACH_TO_FORM:
      return (state
        .setIn(['fields', payload.name], field(undefined, action))
        .validate()
      );
    case DETACH_FROM_FORM:
      return state.removeIn(['fields', payload.name]);
    case TOUCH:
      return state.set('fields', state.get('fields').map(f => field(f, action)));
    case CHANGE:
      return (state
        .set('fields', state.get('fields').map(f => f.setNeedsValidation(payload)))
        .setIn(['fields', payload.name], field(state.getIn(['fields', payload.name]), action))
        .validate()
      );
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
    case RECEIVE_VALIDATION_ERRORS: {
      const newField = field(state.getIn(['fields', payload.name]), action);
      return state.setIn(['fields', payload.name], newField);
    }
    default:
      return state;
  }
};

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
    case RECEIVE_VALIDATION_ERRORS:
      return state.set(payload.id, form(state.get(payload.id), action));
    default:
      return state;
  }
};

export default forms;
