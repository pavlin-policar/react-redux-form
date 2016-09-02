import React from 'react';
import { shallow, mount } from 'enzyme';
import expect from 'expect';
import { forEach } from 'lodash';
import { Map, List } from 'immutable';

import { createFormWrapper } from '../createForm';


describe('createForm', () => {
  describe('wrapping component', () => {
    // Spies for mapDispatchToProps
    const mapDispatchToProps = {
      registerForm: expect.createSpy(),
      unregisterForm: expect.createSpy(),
      attachToForm: expect.createSpy(),
      detachFromForm: expect.createSpy(),
      change: expect.createSpy(),
      touch: expect.createSpy(),
      dispatch: expect.createSpy(),
    };
    const emptyMapStateToProps = {
      isSubmitting: false,
      values: Map(),
      errors: Map(),
      isValid: false,
      fieldNames: List(),
      fieldsTouched: Map(),
    };
    // Setup a test form component
    const FormComponent = createFormWrapper({
      id: 'testForm',
    })(() => (<div id="form" />));

    /**
     * Tests
     */

    afterEach(() => {
      forEach(mapDispatchToProps, spy => spy.restore());
    });

    it('should register and unregister itself with store', () => {
      const renderedComponent = mount(
        <FormComponent {...mapDispatchToProps} {...emptyMapStateToProps} />
      );
      expect(mapDispatchToProps.registerForm).toHaveBeenCalledWith('testForm');
      renderedComponent.unmount();
      expect(mapDispatchToProps.unregisterForm).toHaveBeenCalledWith('testForm');
    });

    it('should attach its id to `attach`', () => {
      const renderedComponent = shallow(
        <FormComponent {...mapDispatchToProps} {...emptyMapStateToProps} />
      );
      renderedComponent.instance().attach({ name: 'field' });
      expect(mapDispatchToProps.attachToForm).toHaveBeenCalledWith(
        { id: 'testForm', name: 'field' }
      );
    });

    it('should attach its id to `detach`', () => {
      const renderedComponent = shallow(
        <FormComponent {...mapDispatchToProps} {...emptyMapStateToProps} />
      );
      renderedComponent.instance().detach({ name: 'field' });
      expect(mapDispatchToProps.detachFromForm).toHaveBeenCalledWith(
        { id: 'testForm', name: 'field' }
      );
    });

    it('should attach its id to `change`', () => {
      const renderedComponent = shallow(
        <FormComponent {...mapDispatchToProps} {...emptyMapStateToProps} />
      );
      renderedComponent.instance().change({ name: 'field' });
      expect(mapDispatchToProps.change).toHaveBeenCalledWith(
        { id: 'testForm', name: 'field' }
      );
    });

    describe('handleSubmit', () => {
      it('should touch all the fields in the form', () => {
        const fields = List(['foo', 'bar']);
        const renderedComponent = shallow(
          <FormComponent
            {...mapDispatchToProps}
            {...emptyMapStateToProps}
            fieldNames={fields}
          />
        );
        const submitFunctionSpy = expect.createSpy();
        const handleSubmit = renderedComponent.instance().handleSubmit(submitFunctionSpy);
        handleSubmit({ preventDefault: () => {} });

        expect(mapDispatchToProps.touch).toHaveBeenCalledWith({
          id: 'testForm',
          fields,
        });
      });

      it('should\'t submit when the form has errors', () => {
        const errors = Map({ name: 'error', surname: 'error' });
        const renderedComponent = shallow(
          <FormComponent
            {...mapDispatchToProps}
            {...emptyMapStateToProps}
            errors={errors}
            isValid={false}
          />
        );
        const submitFunctionSpy = expect.createSpy();
        const handleSubmit = renderedComponent.instance().handleSubmit(submitFunctionSpy);

        handleSubmit({ preventDefault: () => {} });
        expect(mapDispatchToProps.dispatch).toNotHaveBeenCalled();
      });

      describe('synchronous submission', () => {
        it('should trigger submit successful if valid', () => {
          const values = Map({ name: 'John', surname: 'Doe' });
          const renderedComponent = shallow(
            <FormComponent
              {...mapDispatchToProps}
              {...emptyMapStateToProps}
              values={values}
              isValid
            />
          );
          const submitFunctionSpy = expect.createSpy().andReturn({ foo: 'foo' });
          const handleSubmit = renderedComponent.instance().handleSubmit(submitFunctionSpy);

          handleSubmit({ preventDefault: () => {} });
          expect(submitFunctionSpy).toHaveBeenCalled();
          expect(mapDispatchToProps.dispatch).toHaveBeenCalledWith({ foo: 'foo' });
        });
      });

      describe('asynchronous submission', () => {
      });
    });
  });
});
