// Pantalla de login y registro para el sistema de citas del PJECZ
import React, { useState } from 'react';
import ForgotPassword from './OlvidoContrasena';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, Paper, InputAdornment,
  ButtonGroup,
  FormControl,
  IconButton,
  Grid,
} from '@mui/material';
import { Sync, Visibility, VisibilityOff } from '@mui/icons-material';
import { login } from '../actions/AuthActions';

// Componente principal de la pantalla de login y registro
const LoginScreen = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/homepage', { replace: true });
    }
  }, []);
  // Estado para alternar entre login y registro
  const [isLogin, setIsLogin] = useState(true);
  // Estado para los campos del formulario
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  // Estado para mostrar loader en el botón
  const [isLoading, setIsLoading] = useState(false);
  // Estado para mostrar mensajes de error o éxito
  const [errorMessage, setErrorMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  // Estado para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);

  // Estados para los campos de registro
  const [nombres, setNombres] = useState('');
  const [apellidoPrimero, setApellidoPrimero] = useState('');
  const [apellidoSegundo, setApellidoSegundo] = useState('');
  const [curp, setCurp] = useState('');
  const [telefono, setTelefono] = useState('');

  // Maneja el envío del formulario (login o registro)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    // Validaciones para login
    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        setErrorMessage('Por favor, complete todos los campos');
        setIsLoading(false);
        return;
      }
      try {
        // Llama a la API de login
        const data = await login(email.trim(), password.trim());
        // Guarda el token y email en localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('email', email.trim());
        // Espera 1.2 segundos para mostrar el loader y dar feedback visual
        setTimeout(() => {
          setIsLoading(false);
          navigate('/homepage');
        }, 1200);
      } catch (err) {
        setIsLoading(false);
        setErrorMessage('Correo electrónico o contraseña incorrectos');
      }
      return;
    } else {
      // Registro validación de todos los campos
      if (!email.trim() || !confirmEmail.trim()) {
        setErrorMessage('Por favor, complete todos los campos');
        setMessageType('error');
        setIsLoading(false);
        return;
      }
      // Validación de coincidencia de correos
      if (email.trim() !== confirmEmail.trim()) {
        setErrorMessage('Los correos electrónicos no coinciden');
        setMessageType('error');
        setIsLoading(false);
        return;
      }
      
      // Validar campos adicionales de registro
      if (!nombres.trim() || !apellidoPrimero.trim() || !apellidoSegundo.trim() || !curp.trim() || !telefono.trim()) {
        setErrorMessage('Por favor, complete todos los campos');
        setMessageType('error');
        setIsLoading(false);
        return;
      }
      try {
        // Llama a la API de registro
        const { registrarUsuario } = await import('../actions/AuthActions');
        const payload = {
          nombres: nombres.trim(),
          apellido_primero: apellidoPrimero.trim(),
          apellido_segundo: apellidoSegundo.trim(),
          curp: curp.trim(),
          telefono: telefono.trim(),
          email: email.trim(),
        };
        const resp = await registrarUsuario(payload);
        setIsLoading(false);
        if (resp.success) {
          setMessageType('success');
          setErrorMessage('Cuenta creada exitosamente. Revisa tu correo para validar el registro.');
          // Opcional: limpiar campos
          setNombres(''); setApellidoPrimero(''); setApellidoSegundo(''); setCurp(''); setTelefono('');
          setEmail(''); setConfirmEmail('');
          setTimeout(() => {
            setErrorMessage('');
          }, 6000);
        } else {
          setErrorMessage(resp.message || 'No se pudo crear la cuenta');
          setMessageType('error');
        }
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage(err.message || 'Error inesperado al crear la cuenta');
        setMessageType('error');
      }
      return;
    }
  };


  // Cambia entre los modos de login y registro y limpia los campos
  const switchMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setEmail('');
    setConfirmEmail('');
    setPassword('');
    setNombres('');
    setApellidoPrimero('');
    setApellidoSegundo('');
    setCurp('');
    setTelefono('');
    setErrorMessage('');
  };

  // Renderizado principal de la pantalla
  if (showForgotPassword) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100%',
          height: '100%',
          backgroundImage: "url('/images/bg3.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: { xs: 'scroll', sm: 'fixed' },
          backgroundBlendMode: 'overlay',
          backgroundOpacity: 0.4,
          backgroundColor: 'rgba(0, 0, 0, 0.12)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          p: { xs: 0, sm: 2 },
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.38)', backdropFilter: 'blur(4px)' }} />
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        height: '100%',
        backgroundImage: "url('/images/bg3.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        backgroundAttachment: { xs: 'scroll', sm: 'fixed' },
        backgroundBlendMode: 'overlay',
        backgroundOpacity: 0.4,
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        p: { xs: 0, sm: 2 },
      }}
    >
      {/* Capa oscura y blur sobre la imagen de fondo */}
      <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.38)', backdropFilter: 'blur(4px)' }} />
      <Paper elevation={2} sx={{
        // zIndex: 1,
        maxWidth: { xs: 380, sm: 460 },
        width: '100%',
        p: { xs: 2, sm: 4 },
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgb(236, 236, 236)',
        borderRadius: 3,
        mx: { xs: 1, sm: 'auto' },
        my: { xs: 4, sm: 2, md: 1 }
      }}>
        {/* Logo institucional */}
        <Box textAlign="center">
          <img src="/images/logo-horizontal-600x200-negro.png" alt="Logo PJECZ" style={{ width: 300, height: 'auto', display: 'block', margin: '0 auto' }} />
        </Box>
        <Box textAlign="center" sx={{ mb: 2 }}>
          <img src="/images/logo_transparente.png" alt="Logo Sistema Citas" style={{ maxWidth: 200, minWidth: 100, height: 'auto', display: 'block', margin: '0 auto' }} />
        </Box>

        <Box display="flex" justifyContent="center" mb={3}>
          <ButtonGroup variant="text" aria-label="login options" sx={{  borderRadius: 2, hover: { backgroundColor: '#708153' }}} fullWidth>
            <Button
              onClick={() => switchMode(true)}
              sx={{
                borderBottom: isLogin ? '2px solid #708153' : 'none',
                color: isLogin ? 'white' : '#65815c',
                backgroundColor: isLogin ? '#708153' : 'transparent',
              }}
            >
              Iniciar Sesión
            </Button>
            <Button
              onClick={() => switchMode(false)}
              sx={{
                borderBottom: !isLogin ? '2px solid #708153' : 'none',
                color: !isLogin ? 'white' : '#65815c',
                backgroundColor: !isLogin ? '#708153' : 'transparent',
              }}
            >
              Crear Cuenta
            </Button>
          </ButtonGroup>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container >
            <Grid size={{ xs: 12, sm: 6, md: 12}} >
              {/* Input principal para el correo electrónico del usuario */}
              <TextField
                fullWidth
                variant="outlined"
                label="Correo Electrónico"
                placeholder="Ingrese su correo electrónico"
                type="email"
                autoComplete="email"
                slotProps={{
                  input: {
                    autoComplete: 'off'
                  },
                  inputLabel: {
                    shrink: true,
                  }
                }}           
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2, input: { color: '#grey.700' }, label: { color: '#045e2c' } }}
              />
            </Grid>

            {/* Confirmar correo solo en registro */}
            {!isLogin && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 12}} >
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Confirmar Correo"
                    placeholder="Ingrese su correo electrónico"
                    type="email"
                    autoComplete="email"
                    slotProps={{
                      input: {
                        autoComplete: 'off'
                      },
                      inputLabel: {
                        shrink: true,
                      }
                    }}           
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    sx={{ mb: 2, input: { color: '#grey.700' }, label: { color: '#045e2c' } }}
                  />
                </Grid>

                {/* Campos adicionales solo en modo registro */}
                <Grid size={{ xs: 12, sm: 6, md: 12}} >
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Nombres"
                    placeholder="Ingrese sus nombres"
                    slotProps={{
                      input: {
                        autoComplete: 'off'
                      },
                      inputLabel: {
                        shrink: true,
                      }
                    }}           
                    value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  sx={{ mb: 2, input: { color: '#grey.700' }, label: { color: '#045e2c' } }}
                />
                </Grid>
                <Grid container rowGap={2} spacing={1}>
                  <Grid size={{ xs: 12, sm: 6, md: 6}} >
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Primer Apellido"
                      placeholder="Ingrese su primer apellido"
                      slotProps={{
                        input: {
                          autoComplete: 'off'
                        },
                        inputLabel: {
                          shrink: true,
                        }
                      }}           
                      value={apellidoPrimero}
                      onChange={(e) => setApellidoPrimero(e.target.value)}
                      sx={{ mb: 2, input: { color: '#grey.700' }, label: { color: '#045e2c' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 6}} >
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Segundo Apellido"
                      placeholder="Ingrese su segundo apellido"
                      slotProps={{
                        input: {
                          autoComplete: 'off'
                        },
                        inputLabel: {
                          shrink: true,
                        }
                      }}           
                      value={apellidoSegundo}
                      onChange={(e) => setApellidoSegundo(e.target.value)}
                      sx={{ mb: 2, input: { color: '#grey.700' }, label: { color: '#045e2c' } }}
                    />
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 12}} >
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="CURP"
                    placeholder="Ingrese su CURP"
                    slotProps={{
                      input: {
                        autoComplete: 'off'
                      },
                      inputLabel: {
                        shrink: true,
                      }
                    }}           
                    value={curp}
                    onChange={(e) => setCurp(e.target.value.toUpperCase())}
                    sx={{ mb: 2, input: { color: '#grey.700' }, label: { color: '#045e2c' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 12}} >
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Teléfono"
                    placeholder="Ingrese su teléfono"
                    slotProps={{
                      input: {
                        autoComplete: 'off'
                      },
                      inputLabel: {
                        shrink: true,
                      }
                    }}           
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    sx={{ mb: 2, input: { color: '#grey.700' }, label: { color: '#045e2c' } }}
                  />
                </Grid>
              </>
            )}

            {/* Input para la contraseña, con opción de mostrar/ocultar solo en login */}
            {isLogin && (
              <FormControl fullWidth variant="outlined">
                <TextField
                  id="contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete="off"
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 2, input: { color: '#grey.700' }, label: { color: '#045e2c' } }}
                  placeholder='Ingrese su contraseña'
                  label="Contraseña"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            sx={{ color: '#65815c' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </FormControl>
            )}

            {/* Mensaje de error o éxito en caso de validación o login/registro */}
            {errorMessage && (
              <Box sx={{ 
                backgroundColor: messageType === 'success' ? '#1976d2' : '#c23636', 
                color: '#fcfcfc', 
                p: 1, 
                borderRadius: 1, 
                fontSize: 14, 
                mb: 2, 
                width: '100%' 
              }}>
                {errorMessage}
              </Box>
            )}

            {/* Opción para recuperar contraseña, solo visible en modo login */}
            {isLogin && (
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Link
                  to="/forgot-password"
                  style={{ color: '#65815c', textTransform: 'none', fontSize: 15 }}
                  onClick={() => setShowForgotPassword(true)}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>
            )}

            {/* Botón principal para enviar el formulario (login o registro) */}
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={isLoading}
              sx={{ backgroundColor: '#65815c', color: 'white', '&:hover': { backgroundColor: '#70815c' }, mb: 2, '&:disabled': { backgroundColor: '#ccc' } }}
              startIcon={isLoading ? <Sync sx={{ animation: 'spin 1s linear infinite' }} /> : null}
            >
              {isLoading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </Grid>
        </Box>
        {/* Logo institucional */}
        {/* <Box textAlign="center">
          <img src="/images/logo-horizontal-600x200-negro.png" alt="Logo PJECZ" style={{ width: 220, height: 'auto' }} />
        </Box> */}
      </Paper>
    </Box>
  );
};

export default LoginScreen;
