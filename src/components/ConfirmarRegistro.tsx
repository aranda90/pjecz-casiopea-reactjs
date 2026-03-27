import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Card, Divider, Grid, Button, Avatar } from "@mui/material";
import { validarUsuario } from "../actions/AuthActions";
import { AccessTime, BadgeOutlined, CheckCircle, Email, HomeFilled, KeyOutlined, Person, Phone } from "@mui/icons-material";

const ConfirmarRegistro: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(true);
  const [usuario, setUsuario] = useState<any>(null);
  const validacionEjecutada = useRef<boolean>(false);

  /* Mostrar datos de usuario al obtener el id y cadena_validar desde el enlace  y funcion confirmarCuenta */
  useEffect(() => {
    // Evitar múltiples ejecuciones (especialmente por React.StrictMode)
    if (validacionEjecutada.current) return;
    
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const cadena_validar = params.get("cadena_validar");
    
    if (id && cadena_validar) {
      validacionEjecutada.current = true;
      validarUsuario({ id, cadena_validar })
        .then((res) => {
          if (res.success) {
            // Resetear flag en caso de éxito para permitir reintento
            setUsuario(res.data);
            setMensaje(res.message || "Cuenta validada exitosamente");
          } else {
            setMensaje(res.message || "No se pudo validar la cuenta");
          }
        })
        .catch((err) => {
          setMensaje(err.message || "Error al validar la cuenta");
          validacionEjecutada.current = false;
        })
        .finally(() => {
          setCargando(false);
        });
    } else {
      // Resetear flag en caso de error para permitir reintento
      
      setMensaje("Parámetros inválidos");
      setCargando(false);
    }
  }, [location.search,navigate]);

  // Maneja la navegación asegurando que siempre se pasen id y cadena_validar
  const handleCrearContrasena = () => {
    let id = usuario.id;
    let cadena = usuario.cadena_validar;
    if (!cadena) {
      const params = new URLSearchParams(location.search);
      cadena = params.get('cadena_validar') || '';
    }
    if (!id || !cadena) {
      alert('Faltan datos para crear la contraseña.');
      return;
    }
    navigate('/CrearContrasena', { state: { id, cadena_validar: cadena } });
  };

  return (
    <Box sx={{ py: 6, px: 2, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to right, #fff, #f5f5f5)' }}>
      <Card
        sx={{
          maxWidth: 600,
          borderRadius: 4,
          boxShadow: 3,
          overflow: 'hidden',
          p: 3,
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={1}>
          <Avatar
            sx={{
              bgcolor: usuario ? '#65815c' : (cargando ? '#65815c' : 'error.light'),
              color: usuario ? '#fff' : (cargando ? '#fff' : 'error.dark'),
              width: 64,
              height: 64,
              mb: 2,
            }}
          >
            {cargando ? <AccessTime fontSize="large" /> : usuario ? <CheckCircle fontSize="large" /> : <BadgeOutlined fontSize="large" />}
          </Avatar>
          <Typography
            variant="h5"
            align="center"
            color="text.primary"
            fontWeight={600}
            sx={{ color: usuario ? '#65815c' : (cargando ? '#65815c' : 'error.main') }}
          >
            {cargando ? 'Validando registro...' : usuario ? 'Confirmación de registro' : 'Cuenta ya validada'}
          </Typography>
        </Box>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {cargando ? 'Por favor espera...' : mensaje}
        </Typography>
        {usuario && (
          <Box mb={2} width="100%">
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#65815c', mb: 1, textAlign: 'center' }}>Datos del usuario:</Typography>
            <Divider sx={{ mb: 1 }} />
            <Grid container spacing={1}>
              <Grid size={12}>
                <Typography variant="body2"><Person sx={{ verticalAlign: 'middle', mr: 1 }} /> {usuario.nombres} {usuario.apellido_primero} {usuario.apellido_segundo}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2"><Email sx={{ verticalAlign: 'middle', mr: 1 }} /> {usuario.email}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2"><BadgeOutlined sx={{ verticalAlign: 'middle', mr: 1 }} /> {usuario.curp}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2"><Phone sx={{ verticalAlign: 'middle', mr: 1 }} /> {usuario.telefono}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}
        <Box width="100%" mt={2} display="flex" flexDirection="column" gap={1}>
          {usuario ? (
            <Button
              variant="contained"
              onClick={() => handleCrearContrasena()}
              sx={{ borderRadius: 2, color: '#fff', backgroundColor: '#65815c', fontWeight: 600 }}
              fullWidth
              size="large"
              startIcon={<KeyOutlined />}
            >
              Crear contraseña
            </Button>
          ) : !cargando && (
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ borderRadius: 2, fontWeight: 600 }}
              fullWidth
              size="large"
              startIcon={<HomeFilled />}
            >
              Ir al inicio
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default ConfirmarRegistro;
