import expect from 'expect';
import { Map, List, Set } from 'immutable';

import * as actions from '../actions';
import * as select from '../selectors';
import forms from '../reducer';
import { Field } from '../reducers/field';
import { SyncValidator, AsyncValidator } from '../reducers/validators';


// Simulate the application state
const s = (state) => new Map({ forms: state });
const emptyFormState = new Map();

describe('form state', () => {
  describe('form lifecycle', () => {
    let state;
    beforeEach(() => {
      state = forms(emptyFormState, {});
    });

    it('should register forms', () => {
      state = forms(state, actions.registerForm('form1'));
      state = forms(state, actions.registerForm('form2'));
      state = forms(state, actions.registerForm('form3'));
      expect(select.getForm('form1')(s(state)).get('id')).toBe('form1');
      expect(select.getForm('form2')(s(state)).get('id')).toBe('form2');
      expect(select.getForm('form3')(s(state)).get('id')).toBe('form3');
    });

    it('should unregister a form', () => {
      state = forms(state, actions.registerForm('form1'));
      state = forms(state, actions.registerForm('form2'));
      state = forms(state, actions.registerForm('form3'));

      state = forms(state, actions.unregisterForm('form2'));
      expect(select.getForm('form1')(s(state)).get('id')).toBe('form1');
      expect(select.getForm('form2')(s(state)).get('id')).toBe('');
      expect(select.getForm('form3')(s(state)).get('id')).toBe('form3');
    });
  });

  describe('field lifecycle', () => {
    let state;
    beforeEach(() => {
      state = forms(emptyFormState, {});
      state = forms(state, actions.registerForm('form'));
    });

    it('should attach fields to a form', () => {
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field1' }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field2' }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field3' }));
      expect(select.getFormFields('form')(s(state)).size).toBe(3);
      expect(select.getFormFields('form')(s(state)).get('field1')).toBeA(Field);
      expect(select.getFormFields('form')(s(state)).get('field2')).toBeA(Field);
      expect(select.getFormFields('form')(s(state)).get('field3')).toBeA(Field);
    });

    it('should detach fields from a form', () => {
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field1' }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field2' }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field3' }));

      state = forms(state, actions.detachFromForm({ id: 'form', name: 'field2' }));
      expect(select.getFormFields('form')(s(state)).size).toBe(2);
      expect(select.getFormFields('form')(s(state)).get('field1')).toBeA(Field);
      expect(select.getFormFields('form')(s(state)).get('field2')).toNotBeA(Field);
      expect(select.getFormFields('form')(s(state)).get('field3')).toBeA(Field);
    });
  });

  describe('form actions', () => {
    let state;
    beforeEach(() => {
      // Prepare a form with id `form` containing 3 fields
      state = forms(emptyFormState, {});
      state = forms(state, actions.registerForm('form'));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field1' }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field2' }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field3' }));
    });

    describe('form submission', () => {
      it('shouldn\'t be submitting by default', () => {
        expect(select.getFormIsSubmitting('form')(s(state))).toBe(false);
      });

      it('should set its submitting flag to true when it is submitted', () => {
        state = forms(state, actions.submit({ id: 'form' }));
        expect(select.getFormIsSubmitting('form')(s(state))).toBe(true);
      });

      it('should set its submitting flag to false when it receives a successful response', () => {
        state = forms(state, actions.submit({ id: 'form' }));
        state = forms(state, actions.submitSuccessful({ id: 'form' }));
        expect(select.getFormIsSubmitting('form')(s(state))).toBe(false);
      });

      it('should set its submitting flag to false when it receives a failed response', () => {
        state = forms(state, actions.submit({ id: 'form' }));
        state = forms(state, actions.submitFailed({ id: 'form', errors: {} }));
        expect(select.getFormIsSubmitting('form')(s(state))).toBe(false);
      });

      it('should set its field errors when it receives a failed response', () => {
        state = forms(state, actions.submitFailed({
          id: 'form',
          errors: {
            field1: ['validation1', 'validation2'],
            field2: ['validation3'],
          },
        }));
        expect(select.getFormErrors('form')(s(state))).toEqual(new Map({
          field1: Set(['validation1', 'validation2']),
          field2: Set(['validation3']),
          field3: Set(),
          form: Set(),
        }));
      });
    });
  });

  describe('field actions', () => {
    let state;
    beforeEach(() => {
      // Prepare a form with id `form` containing 3 fields
      state = forms(emptyFormState, {});
      state = forms(state, actions.registerForm('form'));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field1' }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field2' }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field3' }));
    });

    describe('touched', () => {
      it('should have its touched flag to false by default', () => {
        expect(select.getFieldTouched('form', 'field1')(s(state))).toBe(false);
        expect(select.getFieldTouched('form', 'field2')(s(state))).toBe(false);
        expect(select.getFieldTouched('form', 'field3')(s(state))).toBe(false);
      });

      it('should set its touched flag to true when being blurred out for the first time', () => {
        state = forms(state, actions.blur({ id: 'form', name: 'field1' }));
        expect(select.getFieldTouched('form', 'field1')(s(state))).toBe(true);
      });

      it('should touch all the fields if no field is passed to the `touch` action', () => {
        state = forms(state, actions.touch({ id: 'form' }));
        expect(
          select.getFormTouchedFields('form')(s(state))
        ).toEqual(
          new Map({ field1: true, field2: true, field3: true })
        );
      });

      it('should be able to touch a single field using the `touch` action', () => {
        state = forms(state, actions.touch({ id: 'form', field: 'field2' }));
        expect(
          select.getFormTouchedFields('form')(s(state))
        ).toEqual(
          new Map({ field1: false, field2: true, field3: false })
        );
      });

      it('should be able to touch multiple fields at once using the `touch` action', () => {
        state = forms(state, actions.touch({ id: 'form', fields: ['field1', 'field3'] }));
        expect(
          select.getFormTouchedFields('form')(s(state))
        ).toEqual(
          new Map({ field1: true, field2: false, field3: true })
        );
      });
    });

    describe('value', () => {
      it('should be an empty string by default', () => {
        expect(select.getFormValues('form')(s(state))).toEqual(
          new Map({ field1: '', field2: '', field3: '' })
        );
      });

      it('should change its value when it is changed', () => {
        state = forms(state, actions.change({ id: 'form', name: 'field2', value: 'new' }));
        expect(select.getFieldValue('form', 'field2')(s(state))).toBe('new');
      });
    });
  });

  describe('synchronous validation', () => {
    let state;
    beforeEach(() => {
      // Prepare a form with id `form` containing 3 fields
      state = forms(emptyFormState, {});
      state = forms(state, actions.registerForm('form'));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field1', validationString: 'required' }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field2', validationString: 'required' }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field3', validationString: 'length:1,3' }));
    });

    it('should parse sync validators from the validation string when being attached to form', () => {
      state = forms(emptyFormState, {});
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field1', validationString: 'required|length:1' }));
      expect(
        select.getFieldSyncValidators('form', 'field1')(s(state))
      ).toEqual(new List([
        new SyncValidator({ name: 'required' }),
        new SyncValidator({ name: 'length', params: ['1'] }),
      ]));
    });

    it('should validate the field when the field is attched to the form', () => {
      state = forms(emptyFormState, {});

      state = forms(state, actions.attachToForm({ id: 'form', name: 'field1', validationString: 'required' }));
      expect(select.getFieldSyncErrors('form', 'field1')(s(state))).toEqual(Set(['required']));

      state = forms(state, actions.attachToForm({ id: 'form', name: 'field2', validationString: 'length:1,2' }));
      expect(select.getFieldSyncErrors('form', 'field2')(s(state))).toEqual(Set(['length']));
    });

    it('should validate the entire form when a value changes', () => {
      state = forms(state, actions.change({ id: 'form', name: 'field3', value: 'toolong' }));
      expect(
        select.getFormErrors('form')(s(state))
      ).toEqual(Map({
        field1: Set(['required']),
        field2: Set(['required']),
        field3: Set(['length']),
        form: Set(),
      }));
    });
  });

  describe('asynchronous validate', () => {
    let state;
    const async1 = expect.createSpy();
    const async2 = expect.createSpy();
    const async3 = expect.createSpy();
    beforeEach(() => {
      // Prepare a form with id `form` containing 3 fields
      state = forms(emptyFormState, {});
      state = forms(state, actions.registerForm('form'));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field1', asyncValidators: { async1, async2 } }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field2', asyncValidators: { async3 } }));
      state = forms(state, actions.attachToForm({ id: 'form', name: 'field3' }));
    });

    it('should parse async validators from params when being attached to form', () => {
      expect(
        select.getFieldAsyncValidators('form', 'field1')(s(state))
      ).toEqual(List([
        new AsyncValidator({ name: 'async1' }),
        new AsyncValidator({ name: 'async2' }),
      ]));
      expect(
        select.getFieldAsyncValidators('form', 'field2')(s(state))
      ).toEqual(List([
        new AsyncValidator({ name: 'async3' }),
      ]));
      expect(
        select.getFieldAsyncValidators('form', 'field3')(s(state))
      ).toEqual(List([]));
    });

    it('should change its `isValidating` flag to true when requesting validation', () => {
      state = forms(state, actions.requestAsyncValidation({ id: 'form', name: 'field1', validator: 'async2' }));
      expect(
        select.getFieldAsyncValidators('form', 'field1')(s(state))
      ).toEqual(List([
        new AsyncValidator({ name: 'async1', isValidating: false }),
        new AsyncValidator({ name: 'async2', isValidating: true }),
      ]));
    });

    it('should change its `isValidating` flag to false when receive errors', () => {
      state = forms(state, actions.noAsyncErrors({ id: 'form', name: 'field1', validator: 'async2' }));
      expect(
        select.getFieldAsyncValidators('form', 'field1')(s(state))
      ).toEqual(List([
        new AsyncValidator({ name: 'async1', isValidating: false }),
        new AsyncValidator({ name: 'async2', isValidating: false }),
      ]));
    });

    it('should change its `isValidating` flag to false when receiving empty error action', () => {
      state = forms(state, actions.receiveAsyncErrors({ id: 'form', name: 'field1', validator: 'async2' }));
      expect(
        select.getFieldAsyncValidators('form', 'field1')(s(state))
      ).toEqual(List([
        new AsyncValidator({ name: 'async1', isValidating: false }),
        new AsyncValidator({ name: 'async2', isValidating: false, error: true }),
      ]));
    });
  });
});
