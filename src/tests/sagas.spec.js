// import expect from 'expect';
// import { put, race, take } from 'redux-saga/effects';
//
// import { createAsyncHandler } from '../sagas';
//
//
// describe('form sagas', () => {
//   describe('asyncHandler saga', () => {
//     const requestAction = {
//       type: 'ACTION',
//       payload: 1,
//     };
//     const id = 'form';
//     const response = 123;
//
//     let formSuccessSpy;
//     let formFailureSpy;
//     let generator;
//     beforeEach(() => {
//       formSuccessSpy = expect.createSpy().andReturn({ type: 'FORM_SUCCESS' });
//       formFailureSpy = expect.createSpy().andReturn({ type: 'FORM_FAILURE' });
//       generator = createAsyncHandler([formSuccessSpy, formFailureSpy])({
//         payload: { id, action: requestAction },
//         meta: {
//           successActionType: 'ACTION_SUCCESS',
//           failureActionType: 'ACTION_FAILURE',
//         },
//       });
//     });
//
//     it('should handle a failed async action', () => {
//       expect(generator.next().value).toEqual(put(requestAction));
//       expect(generator.next().value).toEqual(
//         race({
//           success: take('ACTION_SUCCESS'),
//           failure: take('ACTION_FAILURE'),
//         })
//       );
//       generator.next({ failure: { payload: { error: response } } });
//       expect(formFailureSpy).toHaveBeenCalled();
//       expect(formSuccessSpy).toNotHaveBeenCalled();
//     });
//
//     it('should handle a successful async action', () => {
//       expect(generator.next().value).toEqual(put(requestAction));
//       expect(generator.next().value).toEqual(
//         race({
//           success: take('ACTION_SUCCESS'),
//           failure: take('ACTION_FAILURE'),
//         })
//       );
//       generator.next({ success: { payload: response } });
//       expect(formSuccessSpy).toHaveBeenCalled();
//       expect(formFailureSpy).toNotHaveBeenCalled();
//     });
//   });
// });
