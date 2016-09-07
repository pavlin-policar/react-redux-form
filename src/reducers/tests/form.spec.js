import expect from 'expect';

import { form } from '../form';
import * as actions from '../../actions';


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
});
