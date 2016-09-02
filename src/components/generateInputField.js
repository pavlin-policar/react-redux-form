import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { capitalize, camelCase, forEach } from 'lodash';
import invariant from 'invariant';
import classNames from 'classnames';

import withFormId from './withFormId';
import {
  change,
  focus,
  blur,
} from '../actions';
import { getFieldValue, getFieldTouched } from '../selectors';


/**
 * Generate an input field with common input functionality.
 *
 * @param  {string} type      This should be a valid input[type] string.
 * @param  {object} options   Validations that should be run on the input
 *   field by default e.g. email type fields should run an email validation without
 *   the developer having to explicitly specify that every time they want to use
 *   the component.
 * @return {Component}        A `InputField` component that renders the input
 *   according to the specified options.
 */
export function generateInputComponent(type, { validate = '', className } = {}) {
  return class InputField extends React.Component {
    static displayName = `${capitalize(camelCase(type))}Field`;

    static propTypes = {
      // User defined options
      placeholder: React.PropTypes.string,
      className: React.PropTypes.string,
      name: React.PropTypes.string,
      autoFocus: React.PropTypes.bool,
      disabled: React.PropTypes.bool,
      required: React.PropTypes.bool,
      validate: React.PropTypes.string,
      validateAsync: React.PropTypes.object,
      formId: React.PropTypes.string.isRequired,
      // Event callbacks
      onKeyUp: React.PropTypes.func,
      onChange: React.PropTypes.func,
      onFocus: React.PropTypes.func,
      onBlur: React.PropTypes.func,
      // Connected values
      value: React.PropTypes.string,
      touched: React.PropTypes.bool,
      // Dispatch methods
      blur: React.PropTypes.func,
      focus: React.PropTypes.func,
      change: React.PropTypes.func,
      dispatch: React.PropTypes.func,
    }

    static defaultProps = {
      validate: '',
      validateAsync: {},
    }

    static contextTypes = {
      form: React.PropTypes.object.isRequired,
    }

    constructor(props, context) {
      super(props, context);

      invariant(
        this.context.form,
        'Input type elements must be contained within a valid `Form` component!'
      );

      this.onChange = this.onChange.bind(this);
      this.onFocus = this.onFocus.bind(this);
      this.onBlur = this.onBlur.bind(this);
      this.triggerAsyncValidation = this.triggerAsyncValidation.bind(this);
    }

    componentWillMount() {
      this.context.form.attach({
        name: this.props.name,
        validationString: `${this.props.validate}|${validate}`,
        initialValue: this.props.value,
      });
    }

    shouldComponentUpdate() {
      // TODO: Implement shouldComponentUpdate in generateInputField
      return true;
    }

    componentWillUnmount() {
      this.context.form.detach({ name: this.props.name });
    }

    /**
     * Methods that dispatch actions.
     */

    onChange(e) {
      if ((this.props.onChange && this.props.onChange(e)) || !this.props.onChange) {
        this.props.change({
          id: this.props.formId,
          name: this.props.name,
          value: e.target.value,
        });
      }
    }

    onFocus() {
      this.props.focus({ id: this.props.formId, name: this.props.name });
      if (this.props.onFocus) this.props.onFocus();
    }

    triggerAsyncValidation() {
      const { validateAsync, formId, name, value, dispatch } = this.props;
      forEach(validateAsync, (validateActionRequest) => {
        const action = validateActionRequest(formId, name, { [name]: value });
        // The action may be noop, if the components decide there is no need to
        // validate
        if (action && action.type) dispatch(action);
      });
    }

    onBlur() {
      const { formId, name, onBlur } = this.props;
      this.props.blur({ id: formId, name });
      this.triggerAsyncValidation();
      if (onBlur) onBlur();
    }

    render() {
      return (
        <input
          type={type}
          name={this.props.name}
          id={this.props.name}
          value={this.props.value}
          className={classNames(className, this.props.className)}
          autoFocus={this.props.autoFocus || false}
          disabled={this.props.disabled || false}
          placeholder={this.props.placeholder || ''}
          required={this.props.required || false}
          onKeyUp={this.props.onKeyUp || (() => {})}
          onChange={this.onChange}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        />
      );
    }
  };
}

/**
 * Generate a connected input field component that can function with form
 * components.
 */
export default function generateInputField(...params) {
  const InputField = generateInputComponent(...params);

  const mapStateToProps = (state, { formId, name }) => ({
    value: getFieldValue(formId, name)(state),
    touched: getFieldTouched(formId, name)(state),
  });
  const mapDispatchToProps = (dispatch) => ({
    change: bindActionCreators(change, dispatch),
    focus: bindActionCreators(focus, dispatch),
    blur: bindActionCreators(blur, dispatch),
    dispatch,
  });
  return withFormId(connect(mapStateToProps, mapDispatchToProps)(InputField));
}
