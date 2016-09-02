import { createAction } from 'redux-actions';

import {
  REGISTER_FORM,
  UNREGISTER_FORM,
  ATTACH_TO_FORM,
  DETACH_FROM_FORM,
  CHANGE,
  FOCUS,
  BLUR,
  TOUCH,
  SUBMIT_REQUEST,
  SUBMIT_SUCCESS,
  SUBMIT_FAILURE,
  VALIDATION_REQUEST,
  RECEIVE_VALIDATION_ERRORS,
} from './constants';


export const registerForm = createAction(REGISTER_FORM);
export const unregisterForm = createAction(UNREGISTER_FORM);

export const attachToForm = createAction(ATTACH_TO_FORM);
export const detachFromForm = createAction(DETACH_FROM_FORM);

export const change = createAction(CHANGE);

export const focus = createAction(FOCUS);
export const blur = createAction(BLUR);
export const touch = createAction(TOUCH);

export const submit = createAction(SUBMIT_REQUEST);
export const submitSuccessful = createAction(SUBMIT_SUCCESS);
export const submitFailed = createAction(SUBMIT_FAILURE);

export const requestAsyncValidation = createAction(VALIDATION_REQUEST);
export const receiveAsyncValidationErrors = createAction(RECEIVE_VALIDATION_ERRORS);
