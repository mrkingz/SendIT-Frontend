/* eslint-disable react/forbid-prop-types */
import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Template from "../containers/Template";
import Processing from "../presentations/Processing";
class PageContent extends Component {
  render() {
    return (
      <Template>
        <div className="row no-gutters">
          <div className="col-lg-6 offset-lg-3 col-md-6 offset-md-3 col-sm-12">
            <div className="page">
              {this.props.hasContent ? (
                <Fragment>
                  <div className="page-header">
                    <span className="page-title">{this.props.pageTitle}</span>
                  </div>
                  <div className="page-content">{this.props.children}</div>
                </Fragment>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        {this.props.showProcessing ? <Processing /> : ""}
      </Template>
    );
  }
}

PageContent.defaultProps = {
  hasContent: true
};

PageContent.propTypes = {
  pageTitle: PropTypes.string,
  children: PropTypes.any,
  showProcessing: PropTypes.bool,
  hasContent: PropTypes.bool
};
const mapStateToProps = ({ processingReducer }) => {
  return {
    showProcessing: processingReducer.showProcessing
  };
};
export default connect(mapStateToProps)(PageContent);
