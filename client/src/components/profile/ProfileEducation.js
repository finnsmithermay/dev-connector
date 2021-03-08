import React from 'react'
import PropTypes from 'prop-types'
import Moment from 'react-moment';

const ProfileEducation = ({ education:{
    school, degree, feildofstudy, current, to, from, decription
}}) => {
    return (
        
        <div>
            <h3 className="text-dark">{school}</h3>
            <p>
                <Moment format='YYYY/MM/DD'>{from}</Moment> - 
                {!to ? ' Now ' : <Moment format='YYYY/MM/DD'>{to}</Moment>}
            </p>
            <p>
                <strong>Degree: </strong> {degree}
            </p>
            <p>
                <strong>Decription: </strong> {decription}
            </p>
            <p>
                <strong>Feild of study: </strong> {feildofstudy}
            </p>
        </div>
    )
}

ProfileEducation.propTypes = {
education: PropTypes.array.isRequired,
}

export default ProfileEducation
