import expect from 'expect';
import { Map, List, fromJS } from 'immutable';

import { Form, Field, forms, form, field } from '../reducer';
import {
  registerForm,
  unregisterForm,
  attachToForm,
  detachFromForm,
  change,
  blur,
  submitFailed,
  requestAsyncValidation,
  receiveAsyncValidationErrors,
} from '../actions';


describe('Form reducers', () => {
  describe('Field data type', () => {
    it('should be valid when there are no errors', () => {
      const fieldObj = new Field();
      expect(fieldObj.isValid()).toBe(true);
    });

    it('should be invalid when there are errors', () => {
      const fieldObj = new Field({ errors: List(['error']) });
      expect(fieldObj.isValid()).toBe(false);
    });
  });

  describe('Form data type', () => {
    describe('getData', () => {
      it('should get the data in the fields', () => {
        const formObj = new Form({
          fields: Map({
            foo: new Field({ value: 'foo' }),
            bar: new Field({ value: 'bar' }),
            baz: new Field({ value: 'baz' }),
          }),
        });
        expect(formObj.getData()).toEqual(Map({ foo: 'foo', bar: 'bar', baz: 'baz' }));
      });
    });
    describe('getErrors', () => {
      it('should get the errors in the fields', () => {
        const formObj = new Form({
          fields: Map({
            foo: new Field({ errors: List() }),
            bar: new Field({ errors: List([1]) }),
            baz: new Field({ errors: List([1, 2]) }),
          }),
        });
        expect(formObj.getErrors()).toEqual(
          Map({ foo: List(), bar: List([1]), baz: List([1, 2]) })
        );
      });
    });
    describe('parsingValidators', () => {
      it('should handle multiple validators', () => {
        const result = Form.parseValidators('foo|bar');
        expect(result).toEqual([
          { validator: 'foo', params: [] },
          { validator: 'bar', params: [] },
        ]);
      });

      it('should handle parameters', () => {
        const result = Form.parseValidators('foo:bar,baz|bim:bam');
        expect(result).toEqual([
          { validator: 'foo', params: ['bar', 'baz'] },
          { validator: 'bim', params: ['bam'] },
        ]);
      });

      it('should convert dashes to camel case', () => {
        const result = Form.parseValidators('i-am-a-dash');
        expect(result).toEqual([{ validator: 'iAmADash', params: [] }]);
      });
    });
    describe('validateValue', () => {
      it('should return an array of errors if anything is wrong', () => {
        const formObj = new Form();
        expect(
          formObj.validateValue('21', [
            { validator: 'alpha' },
            { validator: 'length', params: ['3'] },
          ])
        ).toEqual(['alpha', 'length']);
      });
    });
    describe('isValid', () => {
      it('should be valid if the fields contain no errors', () => {
        const formObj = new Form({ fields: Map({
          one: new Field({ errors: List() }),
          two: new Field({ errors: List() }),
          three: new Field({ errors: List() }),
        }) });
        expect(formObj.isValid()).toBe(true);
      });

      it('should be invalid if the fields contain errors', () => {
        const formObj = new Form({ fields: Map({
          one: new Field({ errors: List(['error']) }),
          two: new Field({ errors: List() }),
          three: new Field({ errors: List() }),
        }) });
        expect(formObj.isValid()).toBe(false);
      });
    });
    describe('validate', () => {
      const formObj = new Form({ fields: Map({
        one: new Field({
          value: '',
          validators: [
            { validator: 'required' },
            { validator: 'length', params: ['3'] },
          ],
        }),
        two: new Field({
          value: '123',
          validators: [
            { validator: 'alpha' },
            { validator: 'length', params: ['3'] },
          ],
        }),
      }) });
      expect(
        formObj.validate().getIn(['fields', 'one', 'errors'])
      ).toEqual(List(['required', 'length']));
      expect(
        formObj.validate().getIn(['fields', 'two', 'errors'])
      ).toEqual(List(['alpha']));
    });
  });

  describe('Forms reducer', () => {
    describe('registerForm action', () => {
      it('should register a form', () => {
        const initialState = fromJS({ existing: new Form() });
        const state = forms(initialState, registerForm('newForm'));
        expect(state.has('existing')).toBe(true);
        expect(state.has('newForm')).toBe(true);
        expect(state.get('newForm')).toBeA(Form);
      });
    });

    describe('unregisterForm action', () => {
      it('should remove a form', () => {
        const initialState = fromJS({ one: new Form(), two: new Form() });
        const state = forms(initialState, unregisterForm('two'));
        expect(state.has('one')).toBe(true);
        expect(state.has('two')).toBe(false);
      });
    });
  });

  describe('Form reducer', () => {
    describe('attachToForm action', () => {
      it('should attach a field to the form', () => {
        const initialState = new Form({ fields: Map({ existing: new Field() }) });
        const state = form(initialState, attachToForm({ name: 'newField' }));
        expect(state.hasIn(['fields', 'existing'])).toBe(true);
        expect(state.hasIn(['fields', 'newField'])).toBe(true);
        expect(state.getIn(['fields', 'newField'])).toBeA(Field);
      });
    });

    describe('detachFromForm action', () => {
      it('should detach a field from the form', () => {
        const initialState = new Form({ fields: Map({ one: new Field(), two: new Field() }) });
        const state = form(initialState, detachFromForm({ name: 'two' }));
        expect(state.hasIn(['fields', 'one'])).toBe(true);
        expect(state.hasIn(['fields', 'two'])).toBe(false);
      });
    });
  });

  describe('Field reducer', () => {
    describe('attachToForm action', () => {
      it('should parse its validation string if one is provided', () => {
        const initialState = new Field();
        const state = field(initialState, attachToForm({ validationString: 'required' }));
        expect(state.get('validators')).toEqual([{ validator: 'required', params: [] }]);
      });

      it('should not change the default validation string if none is provided', () => {
        const initialState = new Field();
        const expected = initialState.get('validationString');
        const state = field(initialState, attachToForm({ validationString: undefined }));
        expect(state.get('validationString')).toEqual(expected);
      });

      it('should set its default value when it is provided', () => {
        const initialState = new Field();
        const state = field(initialState, attachToForm({ initialValue: 'foo' }));
        expect(state.get('value')).toBe('foo');
      });

      it('should set its name', () => {
        const initialState = new Field();
        const state = field(initialState, attachToForm({ name: 'field' }));
        expect(state.get('name')).toBe('field');
      });
    });

    describe('change action', () => {
      it('should set its value', () => {
        const initialState = new Field({ value: 'original' });
        const state = field(initialState, change({ value: 'changed' }));
        expect(state.get('value')).toEqual('changed');
      });

      it('should set its `needsValidation` flag when its value changes', () => {
        const initialState = new Field({ name: 'field', value: 'original' });
        const state = field(initialState, change({ name: 'field', value: 'changed' }));
        expect(state.get('needsValidation')).toBe(true);
      });

      it('should set its `needsValidation` flag when its validation relies on another field', () => {
        const initialState = new Field({
          name: 'field',
          value: 'original',
          validators: [{ name: 'someValidation', params: ['anotherField'] }],
        });
        const state = field(initialState, change({ name: 'anotherField', value: 'changed' }));
        expect(state.get('needsValidation')).toBe(true);
      });
    });

    describe('blur action', () => {
      it('should set itself to touched on a blur event', () => {
        const initialState = new Field();
        expect(initialState.get('touched')).toBe(false);
        const state = field(initialState, blur());
        expect(state.get('touched')).toBe(true);
      });
    });

    describe('submitFailure action', () => {
      it('should set its errors to the server response errors', () => {
        const errors = ['required', 'email'];
        const initialState = new Field({
          name: 'field',
          errors: ['this', 'should', 'be', 'overwritten'],
        });
        const state = field(initialState, submitFailed({
          errors: {
            field: errors,
          },
        }));
        expect(state.get('errors')).toEqual(fromJS(errors));
      });
    });

    describe('requestAsyncValidation action', () => {
      it('should set its `validating` flag to true', () => {
        const initialState = new Field();
        expect(initialState.get('validating')).toBe(false);
        const state = field(initialState, requestAsyncValidation());
        expect(state.get('validating')).toBe(true);
      });
    });

    describe('receiveAsyncValidationErrors action', () => {
      it('should set its `validating` flag to false', () => {
        const initialState = new Field({ validating: true });
        const state = field(initialState, receiveAsyncValidationErrors({
          errors: { isUnique: false, email: false },
        }));
        expect(state.get('validating')).toBe(false);
      });

      it('should add the async valiation errors to the existing errors', () => {
        const initialState = new Field(fromJS({ errors: ['existing', 'error'] }));
        const state = field(initialState, receiveAsyncValidationErrors({
          errors: { isUnique: false, email: false },
        }));
        expect(state.get('errors')).toEqual(fromJS(['existing', 'error', 'isUnique', 'email']));
      });
    });
  });
});
