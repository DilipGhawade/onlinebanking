import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/auth/authSlice";
import { Button, Form, Alert, Spinner } from "react-bootstrap";
import { authAPI } from "../services/api";

const Login = () => {
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

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Call the authAPI.login method
    const { success, user, error } = authAPI.login(formData.email, formData.password);
    
    if (success && user) {
      // Dispatch login success with user data
      dispatch(loginSuccess(user));
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } else {
      setError(error || "Invalid email or password");
    }
    
    setIsLoading(false);
  };



  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center py-5">
      <div className="row justify-content-center align-items-center g-4 w-100">
        {/* Carousel Section */}
        <div className="col-lg-6 d-none d-lg-block">
          <div
            id="loginCarousel"
            className="carousel slide h-100"
            data-bs-ride="carousel"
            style={{ height: '500px' }}
          >
            <div className="carousel-inner h-100 rounded-4 overflow-hidden position-relative">
              <div className="carousel-item active h-100">
                <img
                  src="/images/slider/slide1.jpg"
                  className="d-block w-100 h-100"
                  alt="Banking"
                  style={{ objectFit: 'cover' }}
                />
                <div className="carousel-caption">
                  <h3>Banking Made Easy</h3>
                  <p>Manage your finances with our secure platform</p>
                </div>
              </div>
              <div className="carousel-item h-100">
                <img
                  src="/images/slider/slide2.jpg"
                  className="d-block w-100 h-100"
                  alt="Finance"
                  style={{ objectFit: 'cover' }}
                />
                <div className="carousel-caption">
                  <h3>Track Your Expenses</h3>
                  <p>Stay on top of your spending with our intuitive tools</p>
                </div>
              </div>
              <div className="carousel-item h-100">
                <img
                  src="/images/slider/slide3.jpg"
                  className="d-block w-100 h-100"
                  alt="Money"
                  style={{ objectFit: 'cover' }}
                />
                <div className="carousel-caption">
                  <h3>Secure Transactions</h3>
                  <p>Your security is our top priority</p>
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
        <div className="col-lg-4 col-md-8">
          <div className="card shadow border-0 rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
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
                    className="py-2"
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
                      className="py-2"
                      required
                    />
                    <button
                      className="btn btn-outline-secondary border-start-0 border"
                      type="button"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
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
