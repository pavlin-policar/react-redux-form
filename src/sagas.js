import { takeEvery, takeLatest } from 'redux-saga';
import { put, race, take } from 'redux-saga/effects';

import { SUBMIT_REQUEST, VALIDATION_REQUEST } from './constants';
import {
  submitSuccessful,
  submitFailed,
  noAsyncErrors,
  receiveAsyncErrors,
} from './actions';


/**
 * VALIDATE
 */
export function* validate({ payload, meta }) {
  const { successActionType, failureActionType } = meta;
  const { id, name, validator, action } = payload;

  // Dispatch the initial form request action
  yield put(action);
  // What response did we get?
  const responseStatus = yield race({
    success: take(successActionType),
    failure: take(failureActionType),
  });

  // Signal that the async action has completed with appropriate status
  if (responseStatus.success) {
    yield put(noAsyncErrors({ id, name, validator }));
  } else {
    yield put(receiveAsyncErrors({ id, name, validator }));
  }
}

function* validateWatcher() {
  yield* takeLatest(VALIDATION_REQUEST, validate);
}

/**
 * SUBMIT
 */
export function* submit({ payload, meta }) {
  const { successActionType, failureActionType, onSubmitSuccess, onSubmitFailure } = meta;
  const { id, action } = payload;

  // Dispatch the initial form request action
  yield put(action);
  // What response did we get?
  const responseStatus = yield race({
    success: take(successActionType),
    failure: take(failureActionType),
  });

  // Signal that the async action has completed with appropriate status
  if (responseStatus.success) {
    const data = responseStatus.success.payload;
    yield put(submitSuccessful({ id, data }));
    if (onSubmitSuccess) onSubmitSuccess();
  } else {
    const { errors } = responseStatus.failure.payload.error;
    yield put(submitFailed({ id, errors }));
    if (onSubmitFailure) onSubmitFailure();
  }
}

function* submitWatcher() {
  yield* takeEvery(SUBMIT_REQUEST, submit);
}

// All sagas to be loaded
export default [
  submitWatcher,
  validateWatcher,
];
