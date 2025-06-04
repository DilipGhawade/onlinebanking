import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../features/auth/authSlice";
import { useState } from "react";
const Login = ({ setUser }) => {
  const carouselImageStyle = {
    height: "400px",
    objectFit: "cover",
    borderRadius: "10px",
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    if (!formData.email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      //   const user = await api.login(formData.email, formData.password);
      //   setUser(user);
      //   console.log("Login successful:", user);
      // navigate("/dashboard");
      if (formData.email && formData.password) {
        dispatch(loginSuccess({ email: formData.email, role: formData.role }));
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center">
      <div className="row justify-content-center g-4 w-100">
        {/* Carousel Section */}
        <div className="col-md-8">
          <div
            id="homeCarousel"
            className="carousel slide"
            data-bs-ride="carousel"
          >
            <div className="carousel-indicators">
              <button
                type="button"
                data-bs-target="#homeCarousel"
                data-bs-slide-to="0"
                className="active"
              ></button>
              <button
                type="button"
                data-bs-target="#homeCarousel"
                data-bs-slide-to="1"
              ></button>
              <button
                type="button"
                data-bs-target="#homeCarousel"
                data-bs-slide-to="2"
              ></button>
            </div>
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img
                  src="/images/slider/slide1.jpg"
                  className="d-block w-100"
                  alt="HR Management"
                  style={carouselImageStyle}
                />
                <div
                  className="carousel-caption"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: "10px",
                    padding: "20px",
                  }}
                >
                  <h3>Welcome to Online Banking</h3>
                  <p>
                    Experience seamless, secure, and smart financial services at
                    your fingertips.
                  </p>
                </div>
              </div>
              <div className="carousel-item">
                <img
                  src="/images/slider/slide1.jpg"
                  className="d-block w-100"
                  alt="Team Management"
                  style={carouselImageStyle}
                />
                <div
                  className="carousel-caption"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: "10px",
                    padding: "20px",
                  }}
                >
                  <h3>Smart Account Management</h3>
                  <p>
                    Effortlessly manage all your personal and business accounts
                    in one place.
                  </p>
                </div>
              </div>
              <div className="carousel-item">
                <img
                  src="/images/slider/slide3.jpg"
                  className="d-block w-100"
                  alt="Performance Analysis"
                  style={carouselImageStyle}
                />
                <div
                  className="carousel-caption"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: "10px",
                    padding: "20px",
                  }}
                >
                  <h3>Track Your Financial Growth</h3>
                  <p>
                    Analyze transactions, monitor spending, and plan for a
                    stronger financial future.
                  </p>
                </div>
              </div>
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#homeCarousel"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#homeCarousel"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="col-md-4">
          <div className="card shadow h-100">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Login</h2>
              <form className="text-start" onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                  />
                </div>
                {/* <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Login As
                  </label>
                  <select
                    className="form-select"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div> */}
                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
