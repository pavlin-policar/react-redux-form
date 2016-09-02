import { takeEvery, takeLatest } from 'redux-saga';
import { put, race, take } from 'redux-saga/effects';

import { submitSuccessful, submitFailed, receiveAsyncValidationErrors } from './actions';
import { SUBMIT_REQUEST, VALIDATION_REQUEST } from './constants';


/**
 * Create an async handler.
 *
 * The only way async handlers differ from each other is that they each trigger
 * a different function to indicate they are done (they dispatch different
 * actions e.g. submit should dispatch SUBMIT_SUCCESS, while validation should
 * dispatch VALIDATION_SUCCESS).
 *
 * @param  {function|array<function>} formActions
 *          This parameter may be a function if the same function is used for
 *          both the success and failure action. Otherwise, it should be an
 *          array containing two functions, first the success, then failure
 *          functions.

 * @return {function}
 *          See internal function docstring for more information.
 */
export function createAsyncHandler(formActions) {
  const [formSuccessAction, formFailureAction] = (
    formActions instanceof Array ?
      formActions :
      [formActions, formActions]
  );
  /**
   * Watch for asynchronous actions.
   *
   * This comes in useful when you don't simply want to listen to request and
   * submit actions, and trigger your own actions when those actions may arrive.
   * This of course requires specially shaped actions which use promises. See
   * createFormActions.js
   *
   * @param  {object}
   *         This object must contain two fields, payload and meta.
   *         Payload must contain an action signature that represents the original
   *         request action. This action will be triggered instantly to trigger
   *         the initial asynchronous flow.
   *         Meta must contain the success and failure action type constants, to
   *         which this saga will listen to. It must also contain resolve and
   *         reject methods that will signal to the form component that we are
   *         indeed dealing with an async action and so it may act appropriately
   *         when the promise is resolved / rejected.
   *
   * @see Form/createFormActions
   *
   * @return {void}
   */
  return function* asyncHandler({ payload, meta }) {
    const { successActionType, failureActionType } = meta;
    const { id, name } = payload;

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
      yield put(formSuccessAction({ id, data }));
    } else {
      const { errors } = responseStatus.failure.payload.error;
      yield put(formFailureAction({ id, name, errors }));
    }
  };
}


function* validateWatcher() {
  yield* takeLatest(
    VALIDATION_REQUEST,
    createAsyncHandler(receiveAsyncValidationErrors)
  );
}

function* submitWatcher() {
  yield* takeEvery(
    SUBMIT_REQUEST,
    createAsyncHandler([submitSuccessful, submitFailed])
  );
}

// All sagas to be loaded
export default [
  submitWatcher,
  validateWatcher,
];
