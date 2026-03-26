// Componente para confirmar la recuperación de contraseña
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  Typography, 
  Button,
  Avatar,
} from '@mui/material';
import { 
  CheckCircle,
  Error as ErrorIcon,
  HomeFilled,
  KeyOutlined,
  AccessTime
} from '@mui/icons-material';
import { forgotPasswordValidate, RecuperacionValidarResponse } from '../actions/AuthActions';
import { el } from 'date-fns/locale';


const ConfirmarRecuperacion: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<RecuperacionValidarResponse['data'] | null>(null);
  const [mensaje, setMensaje] = useState<string>("");

  useEffect(() => {
    const id = searchParams.get('id');
    const cadena_validar = searchParams.get('cadena_validar');
    
    if (id && cadena_validar) {
      forgotPasswordValidate(id, cadena_validar)
        .then((res) => {
          if (res && typeof res === 'object') {
            if (res.success === true && res.data) {
              setUsuario(res.data);
              setMensaje(res.message || 'Recuperación validada exitosamente');
            } else if (res.success === false) {
              
              const errorMsg = res.message || '';
              let mensajeDetallado = 'No se pudo validar la recuperación';
              
              if(errorMsg.includes('cadena')) {
                mensajeDetallado = 'La cadena de validación no es inválida o ha expirado';
              }else if(errorMsg.includes('caracter')) {
                mensajeDetallado = 'La cadena de validación contiene caracteres no válidos';
              }else if(errorMsg.includes('expirado')) {
                mensajeDetallado = 'La cadena de validación ha expirado';
              }else if(errorMsg.includes('formato')) {
                mensajeDetallado = 'La cadena de validación tiene un formato inválido';
              }else{
                mensajeDetallado = res.message || 'No se pudo validar la recuperación';
              }
              setMensaje(mensajeDetallado);
            } 
          } else {
            setMensaje('Respuesta inválida del servidor');
          }
        })
        .catch((err) => {
          setMensaje(err.message || 'Error al validar la recuperación');
        })
        .finally(() => setCargando(false));

    } else {
      setMensaje('Parámetros inválidos o enlace incompleto');
      setCargando(false);
    }
  }, [searchParams]);

  const handleCrearContrasena = () => {
    if (!usuario) {
      alert('No hay datos de usuario disponibles.');
      return;
    }
    let id = usuario.id;
    let cadena = usuario.cadena_validar;
    if (!cadena) {
      cadena = searchParams.get('cadena_validar') || '';
    }
    if (!id || !cadena) {
      alert('Faltan datos para crear la contraseña.');
      return;
    }
    navigate('/CrearContrasena', { state: { id, cadena_validar: cadena, isRecuperacion: true } });
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
            {cargando ? <AccessTime fontSize="large" /> : usuario ? <CheckCircle fontSize="large" /> : <ErrorIcon fontSize="large" />}
          </Avatar>
          <Typography
            variant="h5"
            align="center"
            color="text.primary"
            fontWeight={600}
            sx={{ color: usuario ? '#65815c' : (cargando ? '#65815c' : 'error.main') }}
          >
            {cargando ? 'Validando recuperación...' : usuario ? 'Confirmación de recuperación' : 'Error en validación'}
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
              Crear nueva contraseña
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

export default ConfirmarRecuperacion;
