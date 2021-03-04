import React, {Fragment, useEffect} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import Spinner from '../layout/Spinner';
import {getProfileById} from '../../actions/profile';
import {Link} from 'react-router-dom';

const Profile = ({match, getProfileById, profile:{profile},auth, loading}) => {
    useEffect(() => {
        getProfileById(match.params.id);
    }, [getProfileById]);
    return (
        //if it is your profile show a link to edit it
        <Fragment>
            {profile === null || loading ? <Spinner/> : 
            
            //if not loading or null display profile
            <Fragment>
               <Link to='/profiles' className = 'btn btn-light'>
                   Back to Developers
                   
                </Link> 
                
                {auth.isAuthenticated && auth.loading === 
                false && auth.user._id === profile.user._id 
                && (<Link to='/edit-profile' className='btn btn-dark'>
                    Edit Profile
                </Link>)}
                
            </Fragment>}
            
        </Fragment>
    )
}

Profile.propTypes = {
getProfileById: PropTypes.func.isRequired,
profile: PropTypes.object.isRequired,
auth: PropTypes.object.isRequired,
}

const mapStateToProps = state =>({
    profile: state.profile,

})

export default connect(mapStateToProps, {getProfileById}) (Profile);
