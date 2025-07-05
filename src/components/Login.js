import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/auth/authSlice";
import { Button, Form, Alert, Spinner } from "react-bootstrap";
import { authAPI } from "../services/api";

const Login = () => {
  const carouselColor = {
    color:'white'
  }
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      // Call the authAPI.login method
      const response = await authAPI.login(formData.email, formData.password);
      
      if (response.success && response.user) {
        console.log('Login successful, user:', response.user);
        // Dispatch login success with user data
        dispatch(loginSuccess(response.user));
        // Store user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(response.user));
        // Store token if available
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        // Navigate to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        console.log('Login failed:', response);
        
        // More specific error messages
        if (response.error === 'No user found with this email') {
          setError('No account found with this email address.');
        } else if (response.error === 'Invalid password') {
          setError('Incorrect password. Please try again.');
        } else {
          setError(response.error || 'Invalid email or password');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("An error occurred during login. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center py-3 py-lg-5 px-0 px-lg-3">
      <div className="row justify-content-center align-items-center w-100 mx-0 g-4 g-lg-5">
        {/* Carousel Section - Visible on all screens */}
        <div className="col-12 col-lg-6 d-flex justify-content-center">
          <div
            id="loginCarousel"
            className="carousel slide w-100"
            data-bs-ride="carousel"
            style={{
              maxWidth: '600px',
              height: 'auto',
              aspectRatio: '16/9',
              margin: '0 0 2rem 0',
              borderRadius: '1rem',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="carousel-inner h-100 rounded-4 overflow-hidden position-relative">
              <div className="carousel-item active h-100">
                <div className="position-relative w-100 h-100">
                  <img
                    src="/images/slider/slide1.jpg"
                    className="d-block w-100 h-100"
                    alt="Banking"
                    style={{ 
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      objectPosition: 'center center'
                    }}
                  />
                  <div className="carousel-caption d-none d-md-block" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    <h3 className="h5 fw-bold">Banking Made Easy</h3>
                    <p style={carouselColor} className="mb-0">Manage your finances with our secure platform</p>
                  </div>
                </div>
              </div>
              <div className="carousel-item h-100">
                <div className="position-relative w-100 h-100">
                  <img
                    src="/images/slider/slide2.jpg"
                    className="d-block w-100 h-100"
                    alt="Finance"
                    style={{ 
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      objectPosition: 'center center'
                    }}
                  />
                  <div className="carousel-caption d-none d-md-block" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    <h3 className="h5 fw-bold">Track Your Expenses</h3>
                    <p style={carouselColor} className="mb-0">Stay on top of your spending with our intuitive tools</p>
                  </div>
                </div>
              </div>
              <div className="carousel-item h-100">
                <div className="position-relative w-100 h-100">
                  <img
                    src="/images/slider/slide3.jpg"
                    className="d-block w-100 h-100"
                    alt="Money"
                    style={{ 
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      objectPosition: 'center center'
                    }}
                  />
                  <div className="carousel-caption d-none d-md-block" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    <h3 className="h5 fw-bold">Secure Transactions</h3>
                    <p style={carouselColor} className="mb-0">Your security is our top priority</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#loginCarousel"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              />
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#loginCarousel"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              />
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xxl-4">
          <div className="card shadow border-0 rounded-4 overflow-hidden mx-auto" style={{ maxWidth: '450px' }}>
            <div className="card-body p-4 p-sm-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-2">Welcome Back</h2>
                <p className="text-muted mb-0">Sign in to access your account</p>
              </div>
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              {/* Email/Password Login Form */}
              <Form onSubmit={handleEmailLogin} className="mt-4">
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="fw-medium">Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="py-2 px-3"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label className="fw-medium mb-1">Password</Form.Label>
                    <a href="#forgot-password" className="text-decoration-none small text-primary">
                      Forgot password?
                    </a>
                  </div>
                  <div className="input-group">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="py-2 px-3"
                      required
                    />
                    <button
                      className="btn btn-outline-secondary border-start-0 border d-flex align-items-center justify-content-center"
                      type="button"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{ minWidth: '45px' }}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''} fs-5`}></i>
                    </button>
                  </div>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 fw-medium mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
