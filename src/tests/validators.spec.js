import expect from 'expect';
import { concat } from 'lodash';

import * as validator from '../validators';


function test(options) {
  const args = options.args || [];
  const values = options.values || [];

  let result = [];
  if (options.valid) {
    result = concat(result, options.valid.map((valid) =>
      validator[options.validator](valid, args, values) === true
    ));
  }
  if (options.invalid) {
    result = concat(result, options.invalid.map((invalid) =>
      validator[options.validator](invalid, args, values) === false
    ));
  }
  expect(result.every(el => el === true)).toBe(true);
}

describe('validators', () => {
  it('should validate "required"', () => {
    test({
      validator: 'required',
      valid: ['foo', 'bar'],
      invalid: ['', ' '],
    });
  });

  it('should validate "alphaDash"', () => {
    test({
      validator: 'alphaDash',
      valid: ['foo', 'bar', 'foo-bar'],
      invalid: ['123', '1abc', 'abc_123'],
    });
  });

  it('should validate "sameAs"', () => {
    test({
      validator: 'sameAs',
      args: ['foo'],
      values: { foo: 'bar' },
      valid: ['bar'],
      invalid: ['foo', '123', ''],
    });
  });

  it('should validate "email"', () => {
    test({
      validator: 'email',
      valid: ['', 'example@foo.com'],
      invalid: ['abc'],
    });
  });
});
