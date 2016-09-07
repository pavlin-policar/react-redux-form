import expect from 'expect';
import { Map } from 'immutable';

import * as actions from '../../actions';
import { forms } from '../forms';
import { form, Form, getFormData } from '../form';


describe('Form reducers', () => {
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
  });
});
