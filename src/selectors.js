import { createSelector } from 'reselect';
import { Map } from 'immutable';

import { Form, Field } from './reducer';


/**
 * Direct selector to the todos state domain
 */
export const getFormsDomain = () => (state) => state.get('forms');

// Form selectors
export const getForm = (id) => createSelector(
  getFormsDomain(),
  forms => forms.get(id) || Map()
);
export const getFormProps = (id) => createSelector(
  getForm(id),
  form => (form || new Form()).toJS()
);
export const getFormIsSubmitting = (id) => createSelector(
  getForm(id),
  form => form.get('submitting') || false
);

export const getFormFields = (id) => createSelector(
  getForm(id),
  form => form.get('fields') || Map()
);
export const getFormValues = (id) => createSelector(
  getFormFields(id),
  fields => fields.map(f => f.get('value')) || Map()
);
export const getFormErrors = (id) => createSelector(
  getFormFields(id),
  fields => fields.map(f => f.get('errors')) || Map()
);
export const getFormIsValid = (id) => createSelector(
  getForm(id),
  form => (form.isValid && form.isValid()) || false
);
export const getFormFieldNames = (id) => createSelector(
  getFormFields(id),
  fields => fields.map(f => f.get('name')) || []
);
export const getFormTouchedFields = (id) => createSelector(
  getFormFields(id),
  fields => fields.map(f => f.get('touched')) || Map()
);

// Field selectors
export const getField = (id, name) => createSelector(
  getForm(id),
  form => form.getIn(['fields', name]) || new Field()
);
export const getFieldValue = (id, name) => createSelector(
  getField(id, name),
  field => field.get('value')
);
export const getFieldTouched = (id, name) => createSelector(
  getField(id, name),
  field => field.get('touched')
);


export default getForm;
