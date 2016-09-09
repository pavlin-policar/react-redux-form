import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { omit } from 'lodash';

import {
  registerForm,
  unregisterForm,
  attachToForm,
  detachFromForm,
  change,
  touch,
  submitSuccessful,
  submitFailed,
  clear,
} from './actions';
import {
  getFormValues,
  getFormErrors,
  getFormIsValid,
  getFormFields,
  getFormIsSubmitting,
} from './selectors';


const createFormWrapper = ({ id }) => (FormComponent) =>
  class FormWrapper extends React.Component {
    static displayName = `Form(${FormComponent.displayName})`

    static propTypes = {
      // Connected values
      isSubmitting: React.PropTypes.bool.isRequired,
      values: React.PropTypes.object.isRequired,
      errors: React.PropTypes.object.isRequired,
      isValid: React.PropTypes.bool.isRequired,
      fields: React.PropTypes.object.isRequired,
      // Dispatch methods
      registerForm: React.PropTypes.func.isRequired,
      unregisterForm: React.PropTypes.func.isRequired,
      attachToForm: React.PropTypes.func.isRequired,
      detachFromForm: React.PropTypes.func.isRequired,
      change: React.PropTypes.func.isRequired,
      touch: React.PropTypes.func.isRequired,
      clear: React.PropTypes.func.isRequired,
      dispatch: React.PropTypes.func.isRequired,
    }

    static childContextTypes = {
      form: React.PropTypes.object,
    }

    constructor(props) {
      super(props);

      this.attach = this.attach.bind(this);
      this.detach = this.detach.bind(this);
      this.change = this.change.bind(this);
      this.clear = this.clear.bind(this);
    }

    getChildContext() { return { form: this }; }

    componentWillMount() { this.props.registerForm(id); }

    shouldComponentUpdate(nextProps) {
      return (
        this.props.values !== nextProps.values ||
        this.props.errors !== nextProps.errors ||
        this.props.isValid !== nextProps.isValid ||
        this.props.isSubmitting !== nextProps.isSubmitting ||
        this.props.fields !== nextProps.fields
      );
    }

    componentWillUnmount() { this.props.unregisterForm(id); }

    attach(payload) { this.props.attachToForm({ ...payload, id }); }
    detach(payload) { this.props.detachFromForm({ ...payload, id }); }
    change(payload) { this.props.change({ ...payload, id }); }
    /** Methods available to the form */
    clear(fields) { this.props.clear({ id, fields }); }

    get id() { return id; }

    handleSubmit = (submitFunction, callbacks = []) => (e) => {
      e.preventDefault();
      const { fields, isValid, dispatch, values } = this.props;
      const [onSubmitSuccess, onSubmitFailure] = callbacks;
      const fieldNames = fields.map(f => f.get('name')).toList();
      // Touch all the fields
      this.props.touch({ id, fields: fieldNames });

      if (isValid) {
        dispatch(submitFunction(id, { values }, { onSubmitSuccess, onSubmitFailure }));
      }
    }

    render() {
      // We don't want to give the form access to the dispatch methods specific
      // to Forms, but we still want to pass down any other properties, e.g.
      // forms are often connected components, so they receive props from the
      // state. We need to make the process commutative so that the component
      // can be wrapped `connect(form(Component))` as well as with
      // form(connect(Component))
      const propsToPass = omit(this.props, [
        'registerForm',
        'unregisterForm',
        'attachToForm',
        'detachFromForm',
        'change',
        'touch',
        'clear',
      ]);
      return React.Children.only(
        <FormComponent
          handleSubmit={this.handleSubmit}
          clear={this.clear}
          {...propsToPass}
        />
      );
    }
  };
export { createFormWrapper };


const createForm = (options) => (FormComponent) => {
  const WrappedComponent = createFormWrapper(options)(FormComponent);

  const { id } = options;

  const mapStateToProps = (state) => ({
    isSubmitting: getFormIsSubmitting(id)(state),
    values: getFormValues(id)(state),
    errors: getFormErrors(id)(state),
    isValid: getFormIsValid(id)(state),
    fields: getFormFields(id)(state),
  });
  const mapDispatchToProps = (dispatch) => ({
    registerForm: bindActionCreators(registerForm, dispatch),
    unregisterForm: bindActionCreators(unregisterForm, dispatch),
    attachToForm: bindActionCreators(attachToForm, dispatch),
    detachFromForm: bindActionCreators(detachFromForm, dispatch),
    change: bindActionCreators(change, dispatch),
    touch: bindActionCreators(touch, dispatch),
    submitSuccessful: bindActionCreators(submitSuccessful, dispatch),
    submitFailed: bindActionCreators(submitFailed, dispatch),
    clear: bindActionCreators(clear, dispatch),
    dispatch,
  });
  return connect(mapStateToProps, mapDispatchToProps)(WrappedComponent);
};

export default createForm;
