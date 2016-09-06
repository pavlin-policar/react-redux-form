import expect from 'expect';
import { Map, List } from 'immutable';
import sinon from 'sinon';

import * as validationFunctions from '../validators';
import {
  syncValidator,
  SyncValidator,
  asyncValidator,
  AsyncValidator,
  field,
  Field,
  form,
  Form,
  forms,
  // helper functions
  getFormData,
  validateValue,
} from '../reducer';
import * as actions from '../actions';


describe('Form reducers', () => {
  describe('the async validator reducer', () => {
    it('should have its `isValidating` flag to false by default');
    it('should set its `isValidating` flag to true when a validation is requested');
    it('should reset its `isValidating` flag to false when validation returns errors');
    it('should reset its `isValidating` flag to false when validation returns no errors');
  });

  describe('the sync validator reducer');

  describe('the field reducer', () => {
    describe('attaching to form', () => {
      it('should set its name');
      it('should set its initial value when it is passed', () => {
        let state = field(state, actions.attachToForm({ name: 'f', initialValue: 'val' }));
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
    });

    describe('form submit attempt', () => {
      it('should clear any previous server submit errors');
    });

    describe('form submit failure', () => {
      it('should merge any form errors from the server into its errors');
    });

    describe('asynchronous validation', () => {
      it('should propagate the action to the `asyncValidators` reducer');
    });
  });

  describe('the form reducer', () => {
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
  });

  describe('the forms reducer', () => {
    describe('registering a form', () => {
      it('should set a field with the registered form name with a new form', () => {
        let state;
        state = forms(state, actions.registerForm('f1'));
        state = forms(state, actions.registerForm('f2'));
        expect(state.get('f1')).toBeA(Form);
        expect(state.get('f2')).toBeA(Form);
      });
    });
    describe('unregistering a form', () => {
      it('should remove the field from the list of forms', () => {
        let state;
        state = forms(state, actions.registerForm('f1'));
        state = forms(state, actions.registerForm('f2'));

        state = forms(state, actions.unregisterForm('f2'));
        expect(state.get('f1')).toBeA(Form);
        expect(state.get('f2')).toNotExist();
      });
    });
    describe('any other action', () => {
      it('should be propagated down to the `form` reducer');
    });
  });

  describe('sychronous validation helper methods', () => {
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
      beforeEach(() => {
        sinon.stub(validationFunctions, 'length').returns(false);
        sinon.stub(validationFunctions, 'alpha').returns(false);
        sinon.stub(validationFunctions, 'required').returns(true);
      })

      it('should validate a value when it doesn\'t have to deal with other fields', () => {
        const validators = List([
          new SyncValidator({ name: 'length' }),
          new SyncValidator({ name: 'alpha' }),
          new SyncValidator({ name: 'required' }),
        ]);
        const otherValues = new Map();

        expect(validateValue('123', validators, otherValues)).toEqual(['length', 'alpha'])
      });

    });
  });
});
