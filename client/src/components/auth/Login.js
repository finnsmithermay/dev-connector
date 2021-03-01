import React,{Fragment, useState} from 'react'
import {Link, Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {login} from '../../actions/auth';

export const Login = ({login, isAuthenticated}) => {
    const [formData, setFormData] = useState({
        email:'',
        password:'',
    });
    //destructuring it
    const { email, password } = formData;

    //the [e.target.name] is to get at the name of value we want to change ie email 
    const onChange = e => setFormData({...formData, [e.target.name]: e.target.value});

    const onSubmit = async e =>{
        e.preventDefault();
       
            
            login(email, password);
        
    }

    //redirect if logged in
    //problibly here do admin login
    if(isAuthenticated){
      return <Redirect to="/dashboard"/>
    }

    return (
        <Fragment>
        <h1 className="large text-primary">Sign In</h1>
        <p className="lead"><i className="fas fa-user"></i> Sign in to your account</p>
        <form className="form" onSubmit={e => onSubmit(e)}>
         
          <div className="form-group">
           
            <input type="email"
             placeholder="Email Address" 
             name="email" 
             onChange={e => onChange(e)}
             value={email}  required/>
            
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              name="password"
              minLength="6"
              onChange={e => onChange(e)}
              value={password}  
              required
            />
          </div>
         
          <input type="submit" className="btn btn-primary" value="Login" />
        </form>
        <p className="my-1">
          Dont  have an account? <Link to="/register">Sign up</Link>
        </p>
        </Fragment>
    );
};

login.PropTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, {login}) (Login);