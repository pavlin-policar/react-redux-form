import { createSelector } from 'reselect';
import { Map } from 'immutable';

import { Form, Field } from './reducer';


/**
 * Direct selector to the todos state domain
 */
export const getFormsDomain = () => (state) => state.get('forms') || new Map();

/**
 * FORM SELECTORS
 */
export const getForm = (id) => createSelector(
  getFormsDomain(),
  forms => forms.get(id) || new Form()
);

export const getFormIsSubmitting = (id) => createSelector(
  getForm(id),
  form => form.get('submitting')
);
export const getFormFields = (id) => createSelector(
  getForm(id),
  form => form.get('fields')
);
export const getFormValues = (id) => createSelector(
  getFormFields(id),
  fields => fields.map(f => f.get('value'))
);
export const getFormErrors = (id) => createSelector(
  getFormFields(id),
  fields => fields.map(f => f.get('syncErrors').merge(f.get('asyncErrors')))
);
export const getFormIsValid = (id) => createSelector(
  getFormErrors(id),
  errors => errors.size === 0
);
export const getFormFieldNames = (id) => createSelector(
  getFormFields(id),
  fields => fields.map(f => f.get('name'))
);
export const getFormTouchedFields = (id) => createSelector(
  getFormFields(id),
  fields => fields.map(f => f.get('touched'))
);

/**
 * Field selectors
 */
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
export const getFieldSyncValidators = (id, name) => createSelector(
  getField(id, name),
  field => field.get('syncValidators')
);
export const getFieldSyncErrors = (id, name) => createSelector(
  getField(id, name),
  field => field.get('syncErrors')
);
export const getFieldAsyncValidators = (id, name) => createSelector(
  getField(id, name),
  field => field.get('asyncValidators')
);
export const getFieldAsyncErrors = (id, name) => createSelector(
  getField(id, name),
  field => field.get('asyncErrors')
);


export default getForm;
