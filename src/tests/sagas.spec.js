import expect from 'expect';
import { put, race, take } from 'redux-saga/effects';

import * as actions from '../actions';
import { validate, submit } from '../sagas';


describe('form sagas', () => {
  const requestAction = {
    type: 'ACTION_REQUEST',
    payload: 1,
  };
  const id = 'form';
  const name = 'field';
  const validationName = 'someAsyncValidation';

  describe('validation saga', () => {
    let generator;
    beforeEach(() => {
      expect.spyOn(actions, 'noAsyncErrors').andCallThrough();
      expect.spyOn(actions, 'receiveAsyncErrors').andCallThrough();
      generator = validate({
        payload: { id, name, validationName, action: requestAction },
        meta: {
          successActionType: 'ACTION_SUCCESS',
          failureActionType: 'ACTION_FAILURE',
        },
      });
    });

    afterEach(() => {
      expect.restoreSpies();
    });

    // The data required in the response action for validations
    const requiredAction = { id, name, validationName };

    it('should handle a failed async validation', () => {
      expect(generator.next().value).toEqual(put(requestAction));
      expect(generator.next().value).toEqual(
        race({
          success: take('ACTION_SUCCESS'),
          failure: take('ACTION_FAILURE'),
        })
      );
      generator.next({ failure: { payload: { error: true } } });
      console.log(actions.receiveAsyncErrors.calls[0]);
      expect(actions.receiveAsyncErrors).toHaveBeenCalledWith(requiredAction);
      expect(actions.noAsyncErrors).toNotHaveBeenCalled();
    });

    it('should handle a successful async validation', () => {
      expect(generator.next().value).toEqual(put(requestAction));
      expect(generator.next().value).toEqual(
        race({
          success: take('ACTION_SUCCESS'),
          failure: take('ACTION_FAILURE'),
        })
      );
      generator.next({ success: { payload: true } });
      expect(actions.noAsyncErrors).toHaveBeenCalledWith(requiredAction);
      expect(actions.receiveAsyncErrors).toNotHaveBeenCalled();
    });
  });

  describe('submission saga', () => {
    let generator;
    beforeEach(() => {
      expect.spyOn(actions, 'submitSuccessful').andCallThrough();
      expect.spyOn(actions, 'submitFailed').andCallThrough();
      generator = submit({
        payload: { id, action: requestAction },
        meta: {
          successActionType: 'ACTION_SUCCESS',
          failureActionType: 'ACTION_FAILURE',
        },
      });
    });

    afterEach(() => {
      expect.restoreSpies();
    });

    // The data required in the response action for validations
    const requiredAction = { id };

    it('should handle a failed async validation', () => {
      expect(generator.next().value).toEqual(put(requestAction));
      expect(generator.next().value).toEqual(
        race({
          success: take('ACTION_SUCCESS'),
          failure: take('ACTION_FAILURE'),
        })
      );
      generator.next({ failure: { payload: { error: { errors: true } } } });
      expect(actions.submitFailed).toHaveBeenCalledWith(
        { ...requiredAction, errors: true }
      );
      expect(actions.submitSuccessful).toNotHaveBeenCalled();
    });

    it('should handle a successful async validation', () => {
      expect(generator.next().value).toEqual(put(requestAction));
      expect(generator.next().value).toEqual(
        race({
          success: take('ACTION_SUCCESS'),
          failure: take('ACTION_FAILURE'),
        })
      );
      generator.next({ success: { payload: true } });
      expect(actions.submitSuccessful).toHaveBeenCalledWith(
        { ...requiredAction, data: true }
      );
      expect(actions.submitFailed).toNotHaveBeenCalled();
    });
  });
});
