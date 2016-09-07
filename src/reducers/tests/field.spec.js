import expect from 'expect';

import { field } from '../field';
import * as actions from '../../actions';


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
