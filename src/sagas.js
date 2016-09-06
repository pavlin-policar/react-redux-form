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
  const { id, name, validationName } = payload;

  // Dispatch the initial form request action
  yield put(payload.action);
  // What response did we get?
  const responseStatus = yield race({
    success: take(successActionType),
    failure: take(failureActionType),
  });

  // Signal that the async action has completed with appropriate status
  if (responseStatus.success) {
    const data = responseStatus.success.payload;
    console.log(noAsyncErrors({ id, name, validationName }));
    yield put(noAsyncErrors({ id, name, validationName }));
  } else {
    console.log(noAsyncErrors({ id, name, validationName }));
    yield put(submitFailed({ id, name, validationName }));
  }
}

function* validateWatcher() {
  yield* takeLatest(VALIDATION_REQUEST, validate);
}

/**
 * SUBMIT
 */
export function* submit({ payload, meta}) {
  const { successActionType, failureActionType } = meta;
  const { id } = payload;

  // Dispatch the initial form request action
  yield put(payload.action);
  // What response did we get?
  const responseStatus = yield race({
    success: take(successActionType),
    failure: take(failureActionType),
  });

  // Signal that the async action has completed with appropriate status
  if (responseStatus.success) {
    const data = responseStatus.success.payload;
    yield put(submitSuccessful({ id, data }));
  } else {
    const { errors } = responseStatus.failure.payload.error;
    yield put(submitFailed({ id, errors }));
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
