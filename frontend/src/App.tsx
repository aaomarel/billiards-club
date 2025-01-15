import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Chip,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Star as StarIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme/theme';
import { alpha } from '@mui/material/styles';
import { API_URL } from './config';

// Component imports
import Dashboard from "./components/Dashboard";
import MatchCreationForm from "./components/MatchCreationForm";
import AuthForm from "./components/AuthForm";
import Leaderboard from "./components/Leaderboard";
import AdminPanel from "./components/AdminPanel";

export interface User {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  isAdmin: boolean;
  role: 'member' | 'admin' | 'head_admin';
  stats?: {
    wins: number;
    losses: number;
    elo: number;
    gamesPlayed: number;
  };
  wins?: number;
  losses?: number;
  elo?: number;
  gamesPlayed?: number;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  interface AuthFormProps {
    onAuthSuccess: (token: string, userId: string, user: User) => void;
  }

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          // Validate user data before setting
          if (userData && userData._id && userData.name) {
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            setIsAuthenticated(true);
          } else {
            console.error("Invalid user data received from API");
            handleLogout();
          }
        } else {
          // Handle unauthorized or other errors
          if (response.status === 401) {
            handleLogout();
          }
          console.error("Error fetching user data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        handleLogout();
      }
    }
  };

  const handleAuthSuccess = (token: string, userId: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    // Clear any potentially invalid data
    if (token) {
      try {
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Only set the user if it has the required fields
          if (parsedUser && parsedUser._id && parsedUser.name) {
            setIsAuthenticated(true);
            setUser(parsedUser);
          } else {
            // Invalid user data, clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("user");
          }
        }
        // Fetch latest user data
        fetchUserData();
      } catch (error) {
        console.error("Error parsing stored user:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("user");
      }
    }

    // Fetch user data every minute to keep stats up to date
    const interval = setInterval(fetchUserData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar sx={{ 
              flexWrap: 'wrap',
              justifyContent: { xs: 'space-between', sm: 'flex-start' },
              padding: { xs: 1, sm: 2 }
            }}>
              <Box
                component={Link}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  mr: { xs: 1, sm: 2 },
                  '&:hover': {
                    '& img': {
                      transform: 'scale(1.05)',
                    },
                    '& .MuiTypography-root': {
                      color: alpha(theme.palette.secondary.main, 0.85),
                    },
                  },
                }}
              >
                <Box
                  component="img"
                  src={`${process.env.PUBLIC_URL}/assets/logo.jpg`}
                  alt="Billiards Club Logo"
                  sx={{
                    height: { xs: 40, sm: 48 },
                    width: 'auto',
                    mr: { xs: 1, sm: 2 },
                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                />
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center', 
                    gap: 1,
                    color: theme.palette.secondary.main,
                    fontWeight: 600,
                    transition: 'color 0.2s ease-in-out',
                  }}
                >
                  Billiards Club
                </Typography>
              </Box>

              {isAuthenticated && (
                <Box sx={{ 
                  display: 'flex', 
                  flexGrow: 1,
                  flexWrap: 'wrap',
                  gap: { xs: 1, sm: 6 },
                  justifyContent: { xs: 'center', sm: 'center' },
                  alignItems: 'center',
                  mx: { sm: 6 }
                }}>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/create-match"
                    sx={{ 
                      color: theme.palette.secondary.main,
                      minWidth: { xs: '40px', sm: 'auto' },
                      px: { xs: 1, sm: 2 },
                      fontSize: { sm: '1.1rem' }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Create Match</Box>
                    <PersonIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/leaderboard"
                    sx={{ 
                      color: theme.palette.secondary.main,
                      minWidth: { xs: '40px', sm: 'auto' },
                      px: { xs: 1, sm: 2 },
                      fontSize: { sm: '1.1rem' }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Leaderboard</Box>
                    <StarIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
                  </Button>
                  {user?.isAdmin && (
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/admin"
                      sx={{ 
                        color: theme.palette.secondary.main,
                        minWidth: { xs: '40px', sm: 'auto' },
                        px: { xs: 1, sm: 2 },
                        fontSize: { sm: '1.1rem' }
                      }}
                    >
                      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Admin Panel</Box>
                      <PersonIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
                    </Button>
                  )}
                </Box>
              )}

              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                ml: 'auto'
              }}>
                <IconButton
                  color="inherit"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  sx={{ padding: { xs: 0.5, sm: 1 } }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>

                {isAuthenticated && user && (
                  <>
                    <Chip
                      icon={<PersonIcon />}
                      avatar={
                        user.isAdmin ? (
                          <Avatar sx={{ 
                            bgcolor: 'transparent',
                            '& .MuiSvgIcon-root': { 
                              color: '#FFD700',
                              animation: 'sparkle 2s infinite'
                            }
                          }}>
                            <StarIcon />
                          </Avatar>
                        ) : undefined
                      }
                      label={
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          '& > span': {
                            display: { xs: 'none', sm: 'inline' }
                          }
                        }}>
                          <span>{user.name}</span>
                          <Typography
                            component="span"
                            sx={{
                              fontSize: '0.75rem',
                              color: theme.palette.secondary.light,
                              fontWeight: 600,
                              display: { xs: 'none', sm: 'inline' }
                            }}
                          >
                            ({user.stats?.elo ?? 1200})
                          </Typography>
                        </Box>
                      }
                      sx={{ 
                        mr: { xs: 1, sm: 2 },
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        color: 'inherit',
                        '& .MuiChip-icon': {
                          color: 'inherit'
                        },
                        '@keyframes sparkle': {
                          '0%, 100%': {
                            opacity: 1,
                            transform: 'scale(1)'
                          },
                          '50%': {
                            opacity: 0.8,
                            transform: 'scale(1.1)'
                          }
                        }
                      }}
                    />
                    <Button 
                      color="inherit" 
                      onClick={handleLogout}
                      sx={{ 
                        color: theme.palette.secondary.main,
                        minWidth: { xs: '40px', sm: 'auto' },
                        px: { xs: 1, sm: 2 }
                      }}
                    >
                      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Logout</Box>
                      <PersonIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
                    </Button>
                  </>
                )}
                {!isAuthenticated && (
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/auth"
                    sx={{ 
                      color: theme.palette.secondary.main,
                      minWidth: { xs: '40px', sm: 'auto' },
                      px: { xs: 1, sm: 2 }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Login</Box>
                    <PersonIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
                  </Button>
                )}
              </Box>
            </Toolbar>
          </AppBar>

          <Container>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/create-match"
                element={
                  isAuthenticated ? (
                    <MatchCreationForm />
                  ) : (
                    <Navigate to="/auth" />
                  )
                }
              />
              <Route
                path="/auth"
                element={<AuthForm onAuthSuccess={handleAuthSuccess} />}
              />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route
                path="/admin"
                element={
                  user?.isAdmin ? (
                    <AdminPanel user={user} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
