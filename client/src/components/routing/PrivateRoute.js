import React from 'react'
import PropTypes from 'prop-types'
import {connect } from 'react-redux';
import {Route, Redirect} from 'react-router-dom';
import { loadUser } from '../../actions/auth';

//take the passed companent and anything else that is passed in

//checks if the user is logged in, if not render to the login else render the passed component
const PrivateRoute = ({component: Component, auth: {isAuthenticated, loading},...rest}) => (
    <Route {...rest} render={props => !isAuthenticated && !loading ?
      (<Redirect to='/login'/>) : (<Component {...props}/>)}/>
)


PrivateRoute.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps) (PrivateRoute)
