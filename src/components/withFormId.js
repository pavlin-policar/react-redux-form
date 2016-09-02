import React from 'react';


const withFormId = (Component) => class extends React.Component {
  static displayName = `WithFormId(${Component.displayName})`

  static contextTypes = { form: React.PropTypes.object.isRequired }

  render() {
    return React.Children.only(
      <Component formId={this.context.form.id} {...this.props} />
    );
  }
};

export default withFormId;
