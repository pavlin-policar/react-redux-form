import { generateInputComponent } from '../generateInputField';

import expect from 'expect';
import { shallow } from 'enzyme';
import React from 'react';


function shallowWithFormContext(component) {
  return shallow(component, { context: {
    form: {
      id: 'aFormId',
      attach: () => {},
      detach: () => {},
    },
  } });
}
const common = {
  change: () => {},
  focus: () => {},
  blur: () => {},
};

describe('generateInputComponent', () => {
  it('should generate an input type component', () => {
    const Component = generateInputComponent('text');
    const renderedComponent = shallowWithFormContext(<Component />);
    expect(renderedComponent.find('input').length).toBe(1);
  });

  describe('a simple text component', () => {
    let Component;
    before(() => {
      Component = generateInputComponent('text');
    });

    it('should have type text', () => {
      const renderedComponent = shallowWithFormContext(<Component />);
      expect(renderedComponent.find('input').prop('type')).toEqual('text');
    });

    it('should adopt the className attribute', () => {
      const renderedComponent = shallowWithFormContext(<Component className="test" />);
      expect(renderedComponent.find('input').hasClass('test')).toBe(true);
    });

    it('should adopt the placeholder attribute', () => {
      const renderedComponent = shallowWithFormContext(<Component placeholder="test" />);
      expect(renderedComponent.find('input').prop('placeholder')).toEqual('test');
    });

    it('should adopt the value attribute', () => {
      const renderedComponent = shallowWithFormContext(<Component value="test" />);
      expect(renderedComponent.find('input').prop('value')).toEqual('test');
    });

    it('should adopt the autoFocus attribute', () => {
      const renderedComponent = shallowWithFormContext(<Component autoFocus />);
      expect(renderedComponent.find('input').prop('autoFocus')).toBe(true);
    });

    it('should adopt the disabled attribute', () => {
      const renderedComponent = shallowWithFormContext(<Component disabled />);
      expect(renderedComponent.find('input').prop('disabled')).toBe(true);
    });

    it('should trigger the onKeyUp property', () => {
      const onKeyUpSpy = expect.createSpy();
      const renderedComponent = shallowWithFormContext(<Component onKeyUp={onKeyUpSpy} />);
      renderedComponent.find('input').simulate('keyUp');
      expect(onKeyUpSpy).toHaveBeenCalled();
    });

    it('should trigger the onBlur property', () => {
      const onBlurSpy = expect.createSpy();
      const renderedComponent = shallowWithFormContext(<Component onBlur={onBlurSpy} {...common} />);
      renderedComponent.find('input').simulate('blur');
      expect(onBlurSpy).toHaveBeenCalled();
    });
  });
});
