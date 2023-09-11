import "./App.css";
import axios from "axios";
import { useState } from "react";
import jwt_decode from "jwt-decode";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const BASE_URL = 'http://localhost:3000'

  const refreshToken = async () => {
    try {
      const response = await axios.post(BASE_URL + "/refresh", {
        token: user.refreshToken
      })

      setUser({
        ...user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      })
    } catch (error) {

    }
  };

  const axiosJwt = axios.create()

  axiosJwt.interceptors.request.use(async (config) => {
    let currentDate = new Date();
    const decodedToken = jwt_decode(user.accessToken)

    // CHECK IF TOKEN IS EXPIRED IF YES THEN REFRESH IT
    if (decodedToken.exp * 1000 < currentDate.getTime()) {
      const data = await refreshToken()
      config.headers['authorization'] = "Bearer " + data.accessToken
    }
    return config
  }, (error) => {
    return Promise.reject(error);
  })

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Ha");
    try {
      const res = await axios.post(BASE_URL + "/login", {
        username: username,
        password: password
      })
      setUser(res.data)
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    console.log("Wassup");
    setSuccess(false);
    setError(false);
    try {
      const res = await axiosJwt.delete(BASE_URL + "/users/" + id, {
        headers: { authorization: "Bearer " + user.accessToken }
      })
      setSuccess(true)

    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="container">
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.isAdmin ? "admin" : "user"}</b> dashboard{" "}
            <b>{user.username}</b>.
          </span>
          <span>Delete Users:</span>
          <button className="deleteButton" onClick={() => handleDelete(1)}>
            Delete John
          </button>
          <button className="deleteButton" onClick={() => handleDelete(2)}>
            Delete Jane
          </button>
          {error && (
            <span className="error">
              You are not allowed to delete this user!
            </span>
          )}
          {success && (
            <span className="success">
              User has been deleted successfully...
            </span>
          )}
        </div>
      ) : (
        <div className="login">
          <form onSubmit={handleSubmit}>
            <span className="formTitle">Login</span>
            <input
              type="text"
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="submitButton">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;