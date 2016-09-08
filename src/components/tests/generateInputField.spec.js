import { generateInputComponent } from '../generateInputField';

import expect from 'expect';
import { shallow, mount } from 'enzyme';
import React from 'react';


describe('generateInputComponent', () => {
  let Component = generateInputComponent('text');
  let context;
  beforeEach(() => {
    context = {
      form: {
        id: 'form',
        attach: expect.createSpy(),
        detach: expect.createSpy(),
      },
    };
  });

  afterEach(() => {
    expect.restoreSpies();
  });

  const mountInput = (component) => mount(
    component,
    { context }
  );

  const shallowInput = (component) => shallow(
    component,
    { context }
  );

  describe('react lifecycle hooks', () => {
    it('shuld attach itself to its form when mounting and has a name', () => {
      mountInput(<Component name="text" />);
      expect(context.form.attach).toHaveBeenCalled();
    });
    it('shouldn\'t attach itself to its form if it doesn\'t have a name', () => {
      mountInput(<Component />);
      expect(context.form.attach).toNotHaveBeenCalled();
    });
    it('should detach from its form when unmounting', () => {
      const renderedComponent = mountInput(<Component name="text" />);
      renderedComponent.unmount();
      expect(context.form.detach).toHaveBeenCalled();
    });
  });

  it('should generate an input type component', () => {
    const TextComponent = generateInputComponent('text');
    const renderedComponent = shallowInput(<TextComponent />);
    expect(renderedComponent.find('input').length).toBe(1);
  });

  describe('a simple text component', () => {
    beforeEach(() => {
      Component = generateInputComponent('text');
    });

    it('should have type text', () => {
      const renderedComponent = shallowInput(<Component />);
      expect(renderedComponent.find('input').prop('type')).toEqual('text');
    });

    it('should adopt the className attribute', () => {
      const renderedComponent = shallowInput(<Component className="test" />);
      expect(renderedComponent.find('input').hasClass('test')).toBe(true);
    });

    it('should adopt the placeholder attribute', () => {
      const renderedComponent = shallowInput(<Component placeholder="test" />);
      expect(renderedComponent.find('input').prop('placeholder')).toEqual('test');
    });

    it('should adopt the value attribute', () => {
      const renderedComponent = shallowInput(<Component value="test" />);
      expect(renderedComponent.find('input').prop('value')).toEqual('test');
    });

    it('should adopt the autoFocus attribute', () => {
      const renderedComponent = shallowInput(<Component autoFocus />);
      expect(renderedComponent.find('input').prop('autoFocus')).toBe(true);
    });

    it('should adopt the disabled attribute', () => {
      const renderedComponent = shallowInput(<Component disabled />);
      expect(renderedComponent.find('input').prop('disabled')).toBe(true);
    });

    it('should trigger the onKeyUp property', () => {
      const onKeyUpSpy = expect.createSpy();
      const renderedComponent = shallowInput(<Component onKeyUp={onKeyUpSpy} />);
      renderedComponent.find('input').simulate('keyUp');
      expect(onKeyUpSpy).toHaveBeenCalled();
    });
  });

  describe('focus event', () => {
    it('should trigger the focus action creator', () => {
      const focusActionSpy = expect.createSpy();
      const renderedComponent = shallowInput(
        <Component focus={focusActionSpy} />
      );
      renderedComponent.find('input').simulate('focus');
      expect(focusActionSpy).toHaveBeenCalled();
    });

    it('should call the onFocus callback from props if it is defined', () => {
      const onFocusSpy = expect.createSpy();
      const focusActionSpy = expect.createSpy();
      const renderedComponent = shallowInput(
        <Component onFocus={onFocusSpy} focus={focusActionSpy} />
      );
      renderedComponent.find('input').simulate('focus');
      expect(onFocusSpy).toHaveBeenCalled();
    });
  });

  describe('blur event', () => {
    it('should trigger the blur action creator', () => {
      const blurActionSpy = expect.createSpy();
      const renderedComponent = shallowInput(
        <Component blur={blurActionSpy} />
      );
      renderedComponent.find('input').simulate('blur');
      expect(blurActionSpy).toHaveBeenCalled();
    });

    it('should call the onBlur callback from props if it is defined', () => {
      const onBlurSpy = expect.createSpy();
      const blurActionSpy = expect.createSpy();
      const renderedComponent = shallowInput(
        <Component onBlur={onBlurSpy} blur={blurActionSpy} />
      );
      renderedComponent.find('input').simulate('blur');
      expect(onBlurSpy).toHaveBeenCalled();
    });
  });

  describe('change event', () => {
    const event = { target: { value: 'new' } };
    it('should trigger the change action creator', () => {
      const changeActionSpy = expect.createSpy();
      const renderedComponent = shallowInput(
        <Component change={changeActionSpy} />
      );
      renderedComponent.find('input').simulate('change', event);
      expect(changeActionSpy).toHaveBeenCalled();
    });

    it('should call the onChange callback from props if it is defined', () => {
      const changeActionSpy = expect.createSpy();
      const onChangeSpy = expect.createSpy();
      const renderedComponent = shallowInput(
        <Component change={changeActionSpy} onChange={onChangeSpy} />
      );
      renderedComponent.find('input').simulate('change', event);
      expect(onChangeSpy).toHaveBeenCalled();
    });
  });

  describe('asynchronous validation', () => {
    it('should trigger async validation on blur the first time after it is changed', () => {
      const blurSpy = expect.createSpy();
      const validator1 = expect.createSpy();
      const validator2 = expect.createSpy();
      const renderedComponent = shallowInput(
        <Component validateAsync={{ validator1, validator2 }} blur={blurSpy} />
      );
      expect.spyOn(
        renderedComponent.instance(),
        'shouldPerformAsyncValidation'
      ).andReturn(true);
      renderedComponent.find('input').simulate('blur');
      expect(validator1).toHaveBeenCalled();
      expect(validator2).toHaveBeenCalled();
    });
  });
});
