import React, { Fragment } from "react";
import { connect } from "react-redux";
import omit from "lodash/omit";
import request from "../../js/utils/request";
import Form from "../containers/Form";
import Places from "../globals/Places";
import TextInput from "./TextInput";
import SelectField from "./SelectField";
import actionTypes from "../../js/actions/actionTypes";
import messageAction from "../../js/actions/messageAction";
import modalAction from "../../js/actions/modalAction";
import validator from "../../js/utils/validations/validator";

class UpdateDestination extends Places {
  constructor(props) {
    super(props);
    this.fields = {
      destinationAddress: this.props.destinationAddress,
      destinationStateId: this.props.destinationStateId,
      destinationLGAId: this.props.destinationLGAId
    };
    this.state = {
      fields: this.fields,
      states: [],
      lgas: [],
      errors: {}
    };
    this.fieldRefs = this.createInputRefs(Object.keys(this.fields));
  }

  async componentDidMount() {
    await this.fetchStates();
    this.setState({
      ...this.state,
      lgas: await this.fetchLGAs(this.state.fields.destinationStateId)
    });
  }

  /**
   * @description Handle an input on change event
   *
   * @param {object} event browser event
   */
  onChangeHandler = async event => {
    const { value, name } = event.target;
    this.clearLGAsOnStateSelection(name);
    this.setState({
      ...this.state,
      lgas:
        name !== "destinationStateId"
          ? this.state.lgas
          : await this.fetchLGAs(value, name),
      destinationLGAId: "",
      errors: omit(this.state.errors, name),
      fields: {
        ...this.state.fields,
        destinationLGAId:
          name === "destinationStateId"
            ? ""
            : this.state.fields.destinationStateId,
        [name]: value
      }
    });
  };

  /**
   * @description Fetch all L.G. Areas of a particular state
   *
   * @param {string} stateId the Id of the state
   * @param {object} object with the L.G. Area field name and list of all LGAs as key-value pairs
   */
  fetchLGAs = async stateId => {
    if (name === "destinationLGAId") return this.state.lgas;
    else if (stateId) {
      try {
        const response = await request.get(`/states/${stateId}/lgas`);
        if (response.status === 200) {
          return response.data.lgas;
        }
      } catch (error) {
        if (error.response.status === 404) {
          return [];
        }
        this.props.messageAction({
          type: actionTypes.SHOW_MESSAGE,
          payload: {
            type: "alert-danger",
            message: "Something went wrong, could not load states"
          }
        });
      }
    } else return [];
  };

  updateDestination = async () => {
    try {
      const validation = await validator("destination", this.state.fields);
      if (validation.hasError) {
        this.setState({
          ...this.state,
          errors: validation.errors
        });
        this.fieldRefs[Object.keys(validation.errors)[0]].focus();
      } else {
        const {
          data: { parcel, message }
        } = await request.update(
          `/parcels/${this.props.parcelId}/destination`,
          this.state.fields
        );
        const { stateId, lgaId } = parcel.to;
        const {
          data: { area }
        } = await request.get(`/states/${stateId}/lgas/${lgaId}`);
        parcel.to = { ...parcel.to, ...area };
        this.props.renderUpdate(parcel, message);
      }
    } catch (error) {
      this.props.messageAction({
        type: actionTypes.SHOW_MESSAGE,
        payload: {
          styles: "alert-danger",
          message: "Something went wrong, could not update parcel destination"
        }
      });
    }
  };

  render() {
    const { fields, errors } = this.state;
    return (
      <div className="panel">
        <Form
          btnText="Save"
          btnStyles="btn-block"
          requiredStyles="hide"
          submitHandler={this.updateDestination}
        >
          <TextInput
            name="destinationAddress"
            placeholder="Destination address"
            onChangeHandler={this.onChangeHandler}
            forwardRef={destinationAddress =>
              (this.fieldRefs.destinationAddress = destinationAddress)
            }
            value={fields.destinationAddress}
            error={errors.destinationAddress}
            styles="col-12"
          />
          <SelectField
            id="destination-state"
            name="destinationStateId"
            placeholder="State"
            value={`${fields.destinationStateId}`}
            onChangeHandler={this.onChangeHandler}
            forwardRef={destinationStateId =>
              (this.fieldRefs.destinationStateId = destinationStateId)
            }
            getFieldsName={() => "state"}
            getObjectKey={() => "stateId"}
            options={this.state.states}
            error={errors.destinationStateId}
          />
          <SelectField
            id="desination-lga"
            name="destinationLGAId"
            placeholder="L.G. Area"
            value={`${fields.destinationLGAId}`}
            onChangeHandler={this.onChangeHandler}
            forwardRef={destinationLGAId =>
              (this.fieldRefs.destinationLGAId = destinationLGAId)
            }
            getFieldsName={() => "lga"}
            getObjectKey={() => "lgaId"}
            options={this.state.lgas}
            error={errors.destinationLGAId}
          />
        </Form>
      </div>
    );
  }
}
export default connect(
  null,
  {
    messageAction
  }
)(UpdateDestination);
