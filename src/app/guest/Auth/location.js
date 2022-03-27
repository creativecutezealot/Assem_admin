import React from 'react';
import './signup.scss';
import { Form, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

import Autocomplete from 'react-google-autocomplete';
import environment from '../../../enviroments';

class Location extends React.Component {
    constructor(props) {
        super();
        this.state = {
            showModal: true,
            validated: false,
            address: '',
            location_state: '',
            city: '',
            country: '',
            latitude: null,
            longitude: null,
            currentUser: null,
        };
    }

    componentDidMount() {
        const currentUser = session.get('currentUser');
        if (!currentUser) {
            this.props.history.push('/signup');
        } else {
            if (currentUser.address === '') {
                navigator.geolocation.getCurrentPosition(
                    this.getCoordinates,
                    this.handleLocationError
                );
            } else {
                this.setState({
                    currentUser: currentUser,
                    address: currentUser.address,
                    city: currentUser.city,
                    location_state: currentUser.location_state,
                    isValidForm: true,
                });
            }
        }
    }

    getCoordinates = (position) => {
        console.log('Latitude is :', position.coords.latitude);
        console.log('Longitude is :', position.coords.longitude);
        this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        });
        this.reverseGeocodeCoordinates(
            position.coords.latitude,
            position.coords.longitude
        );
    };

    handleLocationError = (error) => {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert('User denied the request for Geolocation.');
                break;
            case error.POSITION_UNAVAILABLE:
                alert('Location information is unavailable.');
                break;
            case error.TIMEOUT:
                alert('The request to get user location timed out.');
                break;
            case error.UNKNOWN_ERROR:
                alert('User denied the request for Geolocation.');
                break;
            default:
                alert('An unknown error occured.');
        }
    };

    reverseGeocodeCoordinates = (latitude, longitude) => {
        fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=false&key=${environment.GOOGLE_API_KEY}`
        )
            .then((response) => response.json())
            .then((data) => {
                console.log(data.results[0].address_components);

                const address_components = data.results[0].address_components;
                const result = address_components.filter((component) => {
                    return (
                        component.types[0] === 'locality' ||
                        component.types[0] === 'administrative_area_level_1' ||
                        component.types[0] === 'country'
                    );
                });
                const city = result[0].short_name;
                const location_state = result[1].short_name;
                const country = result[2].short_name;
                const formatted_address =
                    city + ', ' + location_state + ', ' + country;

                this.setState({
                    address: formatted_address,
                    city: city,
                    location_state: location_state,
                    country: country,
                });
            })
            .catch((error) => alert(error));
    };

    handleAddress = (place) => {
        console.log('place: ', place);
        const address = place.formatted_address;
        const address_components = place.address_components;
        const city = address_components[0].short_name;
        const location_state =
            address_components.length === 4
                ? address_components[2].short_name
                : address_components[1].short_name;
        const country =
            address_components.length === 4
                ? address_components[3].short_name
                : address_components[2].short_name;
        this.setState({
            address: address,
            location_state: location_state,
            city: city,
            country: country,
        });

        setTimeout(() => {
            this.validateForm();
        }, 500);
    };

    handleNext = async (event) => {
        event.preventDefault();
        const { address, city, location_state, country } = this.state;
        const form = event.currentTarget;
        // const currentUser = session.get('currentUser');
        const currentUser = session.get('currentUser');
        const userid = currentUser.user_id;

        console.log('create checkValidity ==> ', form.checkValidity());
        this.setState({ validated: true });
        if (address === '') {
            helper.showToast('Error', 'Location is required', 3);
        }
        const location_data = {
            address: address,
            city: city,
            location_state: location_state,
            country: country,
            userid: userid,
            onboarding: 'location'
        };
        try {
            const updateRes = await adminApi.updateUser(location_data);
            if (updateRes.status) {
                console.log('updateRes: ', updateRes.data);
                session.set('currentUser', updateRes.data);
                this.props.history.push('/signup/birthday');
            } else {
                helper.showToast('Error', updateRes.data, 3);
            }
        } catch (error) {
            helper.showToast(
                'Error',
                'Failed to update location. Please try again',
                3
            );
        }
    };

    validateForm = () => {
        const { location } = this.state;

        if (location === '') {
            this.setState({
                isValidForm: false,
            });
        } else {
            this.setState({
                isValidForm: true,
            });
        }
    };

    goBack = (event) => {
        event.preventDefault();
        this.props.history.goBack();
    };

    render() {
        const { validated, isValidForm } = this.state;
        // const user_name = currentUser ? currentUser.first_name + ' ' + currentUser.last_name : '';
        return (
            <div className="signup">
                <Form
                    className="signup-form"
                    noValidate
                    validated={validated}
                    onSubmit={this.handleNext}
                >
                    <div className="d-flex align-content-center justify-content-center">
                        <img
                            className="auth-logo"
                            src={require('../../../assets/logo.svg')}
                            alt=""
                        />
                    </div>
                    <h5 className="d-flex align-items-center justify-content-center text-center mt-2 mb-2">
                        What is your location?
                    </h5>
                    <div className="d-flex align-items-center justify-content-center text-center mt-2 mb-2">
                        Tell us where you are located.
                    </div>
                    <Autocomplete
                        apiKey={environment.GOOGLE_API_KEY}
                        placeholder="LOCATION"
                        onPlaceSelected={(place) => {
                            this.handleAddress(place);
                        }}
                        style={{
                            width: '100%',
                            backgroundColor: 'transparent',
                            color: 'white',
                        }}
                        className="form-group register-form-input p-2"
                        defaultValue={this.state.address}
                    />

                    <div className="d-flex align-items-center justify-content-center">
                        <Button
                            type="submit"
                            className="btn btn-primary register-btn"
                            onClick={this.handleNext}
                            disabled={!isValidForm}
                        >
                            NEXT
                        </Button>
                    </div>
                    <div className="d-flex align-items-center justify-content-center mt-3">
                        <Link to="#" onClick={this.goBack}>
                            <span>{'< '}GO BACK</span>
                        </Link>
                    </div>
                    {/* <div className="d-flex align-items-center justify-content-center mt-3">
                        Get the app.
                    </div>
                    <div className="d-flex align-items-center justify-content-center mt-3">
                        <Link to="" target="_blank">
                            <Image
                                src={require('../../../assets/img/appstore.png')}
                                style={{ width: '120px' }}
                            ></Image>
                        </Link>
                    </div> */}
                </Form>
                <div className="background-overlay"></div>
                <video className="video" autoPlay loop muted>
                    <source
                        src={require('../../../assets/video/background.mp4')}
                    />
                </video>
            </div>
        );
    }
}

export default Location;
