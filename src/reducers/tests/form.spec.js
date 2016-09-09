import expect from 'expect';
import { Map, Set } from 'immutable';

import { form, getFormData, validateValue } from '../form';
import * as actions from '../../actions';
import * as fieldReducer from '../field';
import * as validationFunctions from '../../validators';


describe('the form reducer', () => {
  describe('registering a form', () => {
    it('should have an empty id by default', () => {
      const state = form(undefined, {});
      expect(state.get('id')).toBe('');
    });
    it('should set its id', () => {
      const state = form(undefined, actions.registerForm('form1'));
      expect(state.get('id')).toBe('form1');
    });
  });

  describe('attaching a field to form', () => {
    it('should create a field in its fields with the field name');
    it('should validate the form state after attaching a field');
  });

  describe('changing the value', () => {
    it('should revalidate the entire form');
    it('should propagate the action to the `field` reducer');
    it('should clear its `errors` field', () => {
      const initialState = form(undefined, actions.submitFailed(
        { errors: { form: ['invalid'] } }
      ));
      const state = form(initialState, actions.change({}));
      expect(state.get('errors').isEmpty()).toBe(true);
    });
  });

  describe('a submit request', () => {
    it('should set the `submitting` flag to true');
  });

  describe('a submission response', () => {
    it('should set the `submitting` flag to false');
    it('should propagate the action to the `field` reducer');
    it('should set its `errors` field if any is sent back on submit failure', () => {
      const state = form(undefined, actions.submitFailed(
        { errors: { form: ['invalid'] } }
      ));
      expect(state.get('errors')).toEqual(Set(['invalid']));
    });
  });

  describe('async validation', () => {
    beforeEach(() => {
      expect.spyOn(fieldReducer, 'field');
    });
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should let the `field` reducer handle `requestAsyncValidation` and update its own field', () => {
      form(undefined, actions.requestAsyncValidation({}));
      expect(fieldReducer.field).toHaveBeenCalled();
    });
    it('should let the `field` reducer handle `noAsyncErrors` and update its own field', () => {
      form(undefined, actions.noAsyncErrors({}));
      expect(fieldReducer.field).toHaveBeenCalled();
    });
    it('should let the `field` reducer handle `receiveAsyncErrors` and update its own field', () => {
      form(undefined, actions.receiveAsyncErrors({}));
      expect(fieldReducer.field).toHaveBeenCalled();
    });
  });

  describe('clearing the form', () => {
    beforeEach(() => {
      expect.spyOn(fieldReducer, 'field').andCallThrough();
    });
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should let the `field` reducer handle `clear` and update its own field', () => {
      const initialState = form(undefined, actions.attachToForm(
        { name: 'field', initialValue: 'value' }
      ));
      form(initialState, actions.clear({}));
      expect(fieldReducer.field).toHaveBeenCalled();
    });
  });

  describe('helper methods', () => {
    describe('getFormData', () => {
      it('should extract any form data from a form', () => {
        let state;
        state = form(state, actions.attachToForm({ name: 'f1', initialValue: 'val1' }));
        state = form(state, actions.attachToForm({ name: 'f2', initialValue: 'val2' }));
        state = form(state, actions.attachToForm({ name: 'f3', initialValue: 'val3' }));

        expect(getFormData(state)).toEqual(Map({ f1: 'val1', f2: 'val2', f3: 'val3' }));
      });
    });

    describe('validateValue', () => {
      afterEach(() => {
        expect.restoreSpies();
      });

      it('should return an empty array if there are no errors', () => {
        expect.spyOn(validationFunctions, 'length').andReturn(true);
        expect.spyOn(validationFunctions, 'alpha').andReturn(true);
        const validators = [
          { name: 'length', params: ['3', '6'] },
          { name: 'alpha', params: [] },
        ];
        const vals = {};
        expect(validateValue('12', validators, vals)).toEqual([]);
      });

      it('should return an array of errors when there are errors', () => {
        expect.spyOn(validationFunctions, 'length').andReturn(false);
        expect.spyOn(validationFunctions, 'alpha').andReturn(false);
        const validators = [
          { name: 'length', params: ['3', '6'] },
          { name: 'alpha', params: [] },
        ];
        const vals = {};
        expect(validateValue('12', validators, vals)).toEqual(['length', 'alpha']);
      });

      it('should call the validators with other form values', () => {
        expect.spyOn(validationFunctions, 'length').andReturn(false);
        const validators = [
          { name: 'length', params: ['3', '6'] },
        ];
        const vals = { key1: 'val1', key2: 'val2' };
        validateValue('12', validators, vals);
        expect(validationFunctions.length).toHaveBeenCalledWith('12', validators[0].params, vals);
      });
    });
  });
});
