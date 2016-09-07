import expect from 'expect';
import { Map } from 'immutable';

import { form, getFormData } from '../form';
import * as actions from '../../actions';
import * as fieldReducer from '../field';


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
  });

  describe('a submit request', () => {
    it('should set the `submitting` flag to true');
  });

  describe('a submission response', () => {
    it('should set the `submitting` flag to false');
    it('should propagate the action to the `field` reducer');
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
  });
});
