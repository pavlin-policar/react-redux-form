import expect from 'expect';
import { Set } from 'immutable';

import { field, Field, fieldNeedsValidation } from '../field';
import * as actions from '../../actions';
import * as validatorReducer from '../validators';


describe('the field reducer', () => {
  describe('attaching to form', () => {
    it('should set its name');
    it('should set its initial value when it is passed', () => {
      const state = field(state, actions.attachToForm({ name: 'f', initialValue: 'val' }));
      expect(state.get('value')).toBe('val');
    });
    it('should parse and set its validation string for sync validations');
    it('should parse and set its async validators');
    it('should need validation when it is first attached to the form');
  });

  describe('blurring', () => {
    it('should set its `touched` flag to true');
  });

  describe('touching', () => {
    it('should set its `touched` flag to true if no fields are specified');
    it('should set its `touched` flag to  if the fields is specified');
    it('should not set its `touched` flag to true if the fields is not among those specified');
  });

  describe('changing', () => {
    it('should change its `value`');
    it('should set its `needsValidation` flag');
    it('should clear its `asyncErrors`', () => {
      const initialState = field(undefined, actions.attachToForm({
        name: 'field',
        asyncErrors: Set(['error1', 'error2']),
      }));
      const state = field(initialState, actions.change({}));
      expect(state.get('asyncErrors')).toEqual(Set());
    });
    it('should clear its `serverErrors`', () => {
      const initialState = field(undefined, actions.attachToForm({
        name: 'field',
        serverErrors: Set(['error1', 'error2']),
      }));
      const state = field(initialState, actions.change({}));
      expect(state.get('serverErrors')).toEqual(Set());
    });
  });

  describe('form submit attempt', () => {
    it('should clear any previous server submit errors', () => {
      const initialState = field(undefined, actions.attachToForm({
        name: 'field',
        serverErrors: Set(['error1', 'error2']),
      }));
      const state = field(initialState, actions.submit());
      expect(state.get('serverErrors')).toEqual(Set());
    });
  });

  describe('form submit failure', () => {
    it('should merge any form errors from the server into its errors', () => {
      const initialState = field(undefined, actions.attachToForm({
        name: 'field',
      }));
      const state = field(initialState, actions.submitFailed({
        errors: {
          field: ['error1', 'error2'],
          otherField: ['error3', 'error4'],
        },
      }));
      expect(state.get('serverErrors')).toEqual(Set(['error1', 'error2']));
    });
  });

  describe('asynchronous validation', () => {
    beforeEach(() => {
      expect.spyOn(validatorReducer, 'asyncValidator');
    });
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should propagate `requestAsyncValidation` to the `asyncValidators` reducer', () => {
      const state = field(undefined, actions.attachToForm({
        name: 'field',
        asyncValidators: { identity: i => i },
      }));
      field(state, actions.requestAsyncValidation({}));
      expect(validatorReducer.asyncValidator).toHaveBeenCalled();
    });
    it('should propagate `noAsyncErrors` to the `asyncValidators` reducer', () => {
      const state = field(undefined, actions.attachToForm({
        name: 'field',
        asyncValidators: { identity: i => i },
      }));
      field(state, actions.noAsyncErrors({}));
      expect(validatorReducer.asyncValidator).toHaveBeenCalled();
    });
    it('should propagate `receiveAsyncErrors` to the `asyncValidators` reducer', () => {
      const state = field(undefined, actions.attachToForm({
        name: 'field',
        asyncValidators: { identity: i => i },
      }));
      field(state, actions.receiveAsyncErrors({}));
      expect(validatorReducer.asyncValidator).toHaveBeenCalled();
    });

    it('should add the failed async validation to the set of async errors', () => {
      let state = field(undefined, actions.attachToForm({
        name: 'field',
        asyncValidators: { id1: i => i, id2: i => i },
      }));
      state = field(state, actions.receiveAsyncErrors({ validator: 'id1' }));
      expect(state.get('asyncErrors')).toEqual(Set(['id1']));
      state = field(state, actions.receiveAsyncErrors({ validator: 'id2' }));
      expect(state.get('asyncErrors')).toEqual(Set(['id1', 'id2']));
    });

    it('should remove the async validation error when is succeeds', () => {
      let state = field(undefined, actions.attachToForm({
        name: 'field',
        asyncValidators: { id1: i => i, id2: i => i },
      }));
      state = field(state, actions.receiveAsyncErrors({ validator: 'id1' }));
      expect(state.get('asyncErrors')).toEqual(Set(['id1']));
      state = field(state, actions.receiveAsyncErrors({ validator: 'id2' }));
      expect(state.get('asyncErrors')).toEqual(Set(['id1', 'id2']));
      // Begin test
      state = field(state, actions.noAsyncErrors({ validator: 'id1' }));
      expect(state.get('asyncErrors')).toEqual(Set(['id2']));
    });

    it('should remove the async validation error when is requesting again', () => {
      let state = field(undefined, actions.attachToForm({
        name: 'field',
        asyncValidators: { id1: i => i, id2: i => i },
      }));
      state = field(state, actions.receiveAsyncErrors({ validator: 'id1' }));
      expect(state.get('asyncErrors')).toEqual(Set(['id1']));
      state = field(state, actions.receiveAsyncErrors({ validator: 'id2' }));
      expect(state.get('asyncErrors')).toEqual(Set(['id1', 'id2']));
      // Begin test
      state = field(state, actions.requestAsyncValidation({ validator: 'id1' }));
      expect(state.get('asyncErrors')).toEqual(Set(['id2']));
    });
  });

  describe('clearing the form', () => {
    it('should clear its value to an empty string', () => {
      const initialState = field(undefined, actions.attachToForm({
        name: 'field',
        initialValue: 'value',
      }));
      const state = field(initialState, actions.clear({}));
      expect(state.get('value')).toBe('');
    });

    it('should clear its `serverErrors`', () => {
      let initialState = field(undefined, actions.attachToForm(
        { name: 'field' }
      ));
      initialState = field(initialState, actions.submitFailed(
        { errors: { field: ['error1', 'error2'] } }
      ));
      const state = field(initialState, actions.clear());
      expect(state.get('serverErrors').isEmpty()).toBe(true);
    });

    it('should clear its `asyncErrors`', () => {
      let initialState = field(undefined, actions.attachToForm(
        { name: 'field' }
      ));
      initialState = field(initialState, actions.receiveAsyncErrors(
        { errors: { field: ['error1', 'error2'] } }
      ));
      const state = field(initialState, actions.clear());
      expect(state.get('asyncErrors').isEmpty()).toBe(true);
    });

    it('should clear its `syncErrors`', () => {
      const initialState = new Field({
        syncErrors: Set(['error1', 'error2']),
      });
      const state = field(initialState, actions.clear());
      expect(state.get('syncErrors').isEmpty()).toBe(true);
    });

    it('should only clear the data of the specified fields (if multiple specified)', () => {
      const initialState = new Field({
        name: 'field',
        syncErrors: Set(['error1', 'error2']),
      });
      let state = field(initialState, actions.clear({ fields: ['notField'] }));
      expect(state.get('syncErrors').isEmpty()).toBe(false);
      state = field(initialState, actions.clear({ fields: ['field'] }));
      expect(state.get('syncErrors').isEmpty()).toBe(true);
    });

    it('should only clear the data of the specified fields (if single specified with array)', () => {
      const initialState = new Field({
        name: 'field',
        syncErrors: Set(['error1', 'error2']),
      });
      let state = field(initialState, actions.clear({ fields: ['notField'] }));
      expect(state.get('syncErrors').isEmpty()).toBe(false);
      state = field(initialState, actions.clear({ fields: ['field'] }));
      expect(state.get('syncErrors').isEmpty()).toBe(true);
    });

    it('should only clear the data of the specified fields (if single specified with string)', () => {
      const initialState = new Field({
        name: 'field',
        syncErrors: Set(['error1', 'error2']),
      });
      let state = field(initialState, actions.clear({ fields: 'notField' }));
      expect(state.get('syncErrors').isEmpty()).toBe(false);
      state = field(initialState, actions.clear({ fields: 'field' }));
      expect(state.get('syncErrors').isEmpty()).toBe(true);
    });
  });

  describe('helper methods', () => {
    describe('fieldNeedsValidation', () => {
      it('should return true if the field needed validation before the change', () => {
        const fieldObj = new Field({ name: 'field1', value: 'test', needsValidation: true });
        expect(fieldNeedsValidation(fieldObj, 'notField1', 'test')).toEqual(fieldObj);
      });
      it('should return true if the field name matches the name of the field changed and the value is different', () => {
        const fieldObj = new Field({ name: 'field1', value: 'test', needsValidation: false });
        const expected = fieldObj.set('needsValidation', true);
        expect(fieldNeedsValidation(fieldObj, 'field1', 'test2')).toEqual(expected);
      });
      it('should return false if the field name matches the name of the field changed and the value is same', () => {
        const fieldObj = new Field({ name: 'field1', value: 'test', needsValidation: false });
        const expected = fieldObj.set('needsValidation', false);
        expect(fieldNeedsValidation(fieldObj, 'field1', 'test')).toEqual(expected);
      });
      it('should return false if the field name does not match the name of the field changed', () => {
        const fieldObj = new Field({ name: 'field1', value: 'test', needsValidation: false });
        const expected = fieldObj.set('needsValidation', false);
        expect(fieldNeedsValidation(fieldObj, 'field2')).toEqual(expected);
      });
      it('should return true if the field contains a validator containg that field as a param');
    });
  });
});
