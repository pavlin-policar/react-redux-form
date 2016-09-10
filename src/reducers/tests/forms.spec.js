import expect from 'expect';
import { Map } from 'immutable';

import * as actions from '../../actions';
import { forms } from '../forms';
import * as formReducer from '../form';


describe('the forms reducer', () => {
  describe('registering a form', () => {
    it('should set a field with the registered form name with a new form', () => {
      let state;
      state = forms(state, actions.registerForm('f1'));
      state = forms(state, actions.registerForm('f2'));
      expect(state.get('f1')).toBeA(formReducer.Form);
      expect(state.get('f2')).toBeA(formReducer.Form);
    });
  });
  describe('unregistering a form', () => {
    it('should remove the field from the list of forms', () => {
      let state;
      state = forms(state, actions.registerForm('f1'));
      state = forms(state, actions.registerForm('f2'));

      state = forms(state, actions.unregisterForm('f2'));
      expect(state.get('f1')).toBeA(formReducer.Form);
      expect(state.get('f2')).toNotExist();
    });
  });
  describe('any other action', () => {
    beforeEach(() => {
      expect.spyOn(formReducer, 'form');
    });
    afterEach(() => {
      expect.restoreSpies();
    });

    it('should propagate `attachToForm` to the `form` reducer', () => {
      forms(undefined, actions.attachToForm({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `detachFromForm` to the `form` reducer', () => {
      // This form needs an id since detaching form a non-existing form does not
      // work. This is intentional.
      forms(Map({ form: true }), actions.detachFromForm({ id: 'form' }));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `change` to the `form` reducer', () => {
      forms(undefined, actions.change({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `focus` to the `form` reducer', () => {
      forms(undefined, actions.focus({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `blur` to the `form` reducer', () => {
      forms(undefined, actions.blur({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `touch` to the `form` reducer', () => {
      forms(undefined, actions.touch({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `submit` to the `form` reducer', () => {
      forms(undefined, actions.submit({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `submitSuccessful` to the `form` reducer', () => {
      forms(undefined, actions.submitSuccessful({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `submitFailed` to the `form` reducer', () => {
      forms(undefined, actions.submitFailed({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `requestAsyncValidation` to the `form` reducer', () => {
      forms(undefined, actions.requestAsyncValidation({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `noAsyncErrors` to the `form` reducer', () => {
      forms(undefined, actions.noAsyncErrors({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `receiveAsyncErrors` to the `form` reducer', () => {
      forms(undefined, actions.receiveAsyncErrors({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
    it('should propagate `clear` to the `form` reducer', () => {
      forms(undefined, actions.clear({}));
      expect(formReducer.form).toHaveBeenCalled();
    });
  });
});
