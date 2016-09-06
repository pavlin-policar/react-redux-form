import React from 'react';
import { shallow } from 'enzyme';
import expect from 'expect';

import withFormId from '../withFormId';


describe('withFormId', () => {
  it('should take formId from the context and pass it to its child', () => {
    const WrappedComponent = withFormId(<div />)
    const renderedComponent = shallow(
      <WrappedComponent />,
      { context: { form: { id: 'form' } } }
    );
    expect(renderedComponent.prop('formId')).toBe('form');
  });
});
