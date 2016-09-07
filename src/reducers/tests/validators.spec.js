import expect from 'expect';

import * as actions from '../../actions';
import {
  asyncValidator,
  AsyncValidator,
} from '../validators';


describe('the async validator reducer', () => {
  it('should have its `isValidating` flag to false by default', () => {
    const state = asyncValidator(undefined, { payload: {} });
    expect(state.get('isValidating')).toBe(false);
  });
  it('should set its `isValidating` flag to true when a validation is requested', () => {
    const state = asyncValidator(
      new AsyncValidator({ name: 'val' }),
      actions.requestAsyncValidation({ validator: 'val' })
    );
    expect(state.get('isValidating')).toBe(true);
  });
  it('should not change its `isValidating` flag if the action is meant for a different validator', () => {
    const state = asyncValidator(
      new AsyncValidator({ name: 'val' }),
      actions.requestAsyncValidation({ validator: 'notVal' })
    );
    expect(state.get('isValidating')).toBe(false);
  });
  it('should reset its `isValidating` flag to false when validation returns errors', () => {
    const state = asyncValidator(
      new AsyncValidator({ name: 'val' }),
      actions.receiveAsyncErrors({ validator: 'val' })
    );
    expect(state.get('isValidating')).toBe(false);
  });
  it('should reset its `isValidating` flag to false when validation returns no errors', () => {
    const state = asyncValidator(
      new AsyncValidator({ name: 'val' }),
      actions.noAsyncErrors({ validator: 'val' })
    );
    expect(state.get('isValidating')).toBe(false);
  });
});

describe('the sync validator reducer');
