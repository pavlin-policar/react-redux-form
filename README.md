# React redux form
Unobtrusive form state management for react, redux and redux sagas.

#### Note
These docs are incomplete, and the project is still in its very early stages of development so it is unstable. The API may change slightly from time to time. I'm quite happy with the general form API, so it shouldn't change much.

I am, however, unhappy with the way input fields are generated, and how to deal with server responses in a generalized manner.

### About
The reasonable question you should ask yourself when seeing this for the first time would be:

> Why does this exist? Don't we already have redux-form?

The answer is simple. I don't like the API. Also, it doesn't integrate well with `redux-saga`. This project attempts to fix both those things.

### Installation
Using npm: `npm install --save @policar/react-redux-form`.

### Usage

#### Input fields
Input fields are generated using the `generateInputField` function. This generates a HOC that can attach itself to the form, while allowing for great levels of customizability.

*This will definitely change somewhat to allow more custom behaviour and radio and checkbox types.*

```js
import { generateInputField } from '@policar/react-redux-form';

export const TextField = generateInputField('text');
export const EmailField = generateInputField('email');
export const PasswordField = generateInputField('password');
```

#### Actions
Special actions are required to work with the form. The functions `registerAction` and `checkEmailExistsAction` is a normal action creator that you would use. The second parameter takes constants that indicate the success and failure actions.

```js
import { createFormSubmitAction, createFormValidationAction } from '@policar/react-redux-form';

export const register = createFormSubmitAction(
  registerAction,
  [REGISTRATION_SUCCESS, REGISTRATION_FAILURE]
);

export const checkEmailExists = createFormValidationAction(
  checkEmailExistsAction,
  [CHECK_EMAIL_EXISTS_SUCCESS, CHECK_EMAIL_EXISTS_FAILURE]
);
```

#### Form
You can then use these input components and actions in the form.

The form also has a nice API for dealing with validation and asynchronous validation. Also, fields are only registered with the form if they have a `name` prop specified. Otherwise, they are ignored.

```js
import { createForm } from '@policar/react-redux-form';

const RegistrationForm = (props) => (
  <form onSubmit={props.handleSubmit(register)}>
    <div className="row">
      <div className="col-xs-12">
        <TextField
          name="name"
          validate="required|alpha-dash"
        />
      </div>
    </div>
    <div className="row">
      <div className="col-xs-12">
        <EmailField
          name="email"
          validate="required|email"
          validateAsync={{ checkEmailExists }}
        />
      </div>
    </div>
    <div className="row">
      <div className="col-xs-12">
        <PasswordField
          name="password"
          validate="required|length:6"
        />
      </div>
    </div>
    <div className="row">
      <div className="col-xs-12">
        <PasswordField
          name="passwordValidation"
          validate="required|same-as:password"
        />
      </div>
    </div>
    <Button type="submit" disabled={props.isSubmitting}>Register</Button>
  </form>
);

export default createForm({
  id: 'registration',
})(RegistrationForm);
```

The form and input components also provide various props that describe the state of the form.


#### Integration with `redux-saga`
You can write your sagas completely normally, listen to your defined actions. The form component is as unobtrusive as can be. The only thing you need to do, is use the action creators provided by the form, and use `createForm` to define a form.

So the `registrationSaga` for this example would look like this:
```js
export function* registration({ payload }) {
  const { values } = payload;
  const response = yield call(request, URLS.REGISTRATION_URL, {
    method: 'post',
    body: values,
  });

  if (!response.error) {
    yield put(registrationSuccess());
  } else {
    yield put(registrationFailure(response));
  }
}

function* registrationWatcher() {
  yield* takeEvery(REGISTRATION_REQUEST, registration);
}
```
