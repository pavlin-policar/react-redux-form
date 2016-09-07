import { Map } from 'immutable';

import { form } from './form';
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
} from '../constants';


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
