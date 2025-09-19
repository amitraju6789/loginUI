import { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { auth, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
} from "firebase/auth";

function App() {
  const logoRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser)
    );
    return () => unsubscribe();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * canvas.width,
        size: Math.random() * 2.5 + 0.8,
      });
    }

    const mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouse.y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };
    window.addEventListener("mousemove", onMouse);

    let rotation = { x: 0, y: 0, z: 0 },
      rotationSpeed = { x: 0.2, y: 0.2, z: 0.2 },
      speedTimer = 0,
      hue = 0;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((s) => {
        s.z -= 1.6;
        if (s.z <= 0) s.z = canvas.width;
        const k = 128 / s.z;
        const px = s.x * k + canvas.width / 2 + mouse.x * 30;
        const py = s.y * k + canvas.height / 2 + mouse.y * 30;
        ctx.fillStyle = `rgba(0,200,255,0.6)`;
        ctx.beginPath();
        ctx.arc(px, py, s.size * k, 0, Math.PI * 2);
        ctx.fill();
      });

      speedTimer++;
      if (speedTimer > 200) {
        rotationSpeed.x = Math.random() * 0.5 + 0.1;
        rotationSpeed.y = Math.random() * 0.5 + 0.1;
        rotationSpeed.z = Math.random() * 0.5 + 0.1;
        speedTimer = 0;
      }

      rotation.x += rotationSpeed.x;
      rotation.y += rotationSpeed.y;
      rotation.z += rotationSpeed.z;
      hue += Math.random() * 2 + 0.5;
      if (hue > 360) hue = 0;
      const color = `hsl(${hue},100%,60%)`;

      if (logoRef.current) {
        const tiltX = mouse.y * 20;
        const tiltY = mouse.x * 20;
        const scale = 1 + Math.sin(Date.now() / 1000) * 0.05;
        logoRef.current.style.transform = `rotateX(${rotation.x + tiltX}deg) rotateY(${rotation.y + tiltY}deg) rotateZ(${rotation.z}deg) scale(${scale})`;
        logoRef.current.style.filter = `drop-shadow(0 0 30px ${color})`;
      }
      if (textRef.current) {
        const tTiltX = mouse.y * 15,
          tTiltY = mouse.x * 15,
          tScale = 1 + Math.sin(Date.now() / 800) * 0.03;
        textRef.current.style.transform = `rotateX(${tTiltX}deg) rotateY(${tTiltY}deg) scale(${tScale})`;
        textRef.current.style.color = color;
        textRef.current.style.textShadow = `0 0 25px ${color},0 0 50px ${color},0 0 70px ${color}`;
      }

      requestAnimationFrame(animate);
    }
    animate();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!user) {
    return (
      <div className="App">
        <canvas ref={canvasRef} id="starfield"></canvas>
        <div className="auth-overlay">
          <h2>{isSignup ? "Signup" : "Login"}</h2>
          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">{isSignup ? "Signup" : "Login"}</button>
          </form>

          <div style={{ marginTop: 10 }}>
            <button onClick={handleGoogle} className="google-btn">
              Continue with Google
            </button>
          </div>

          {error && <p className="error">{error}</p>}

          <p className="switch" onClick={() => setIsSignup(!isSignup)}>
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Signup"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <canvas ref={canvasRef} id="starfield"></canvas>

      <div className="top-right">
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="center-content">
        <div className="logo-container">
          <img ref={logoRef} src={logo} alt="Logo" className="logo-3d" />
          <div className="shadow"></div>
        </div>
        <h1 ref={textRef} className="glow-text">
          Welcome, {user.email}
        </h1>
      </div>
    </div>
  );
}

export default App;
