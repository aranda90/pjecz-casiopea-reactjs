import React, { useState, useEffect, useMemo } from 'react';
import { Container, Box, Card, DialogContent, DialogTitle, Dialog, Typography, Button, IconButton, DialogActions, Divider, Grow, CircularProgress, Avatar, Grid, CardActions } from '@mui/material';
import { EventBusy} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCitas, cancelarCita, Cita } from '../actions/CitasActions';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';


const HomePage: React.FC = () => {
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

 // Memorizar el ordenamiento para evitar cálculos innecesarios en cada render
  const citasOrdenadas = useMemo(() => {
    return [...citas].sort((a, b) => Date.parse(a.inicio) - Date.parse(b.inicio));
  }, [citas]);

  // Prepara la interfaz para la cancelación: guarda la referencia de la cita seleccionada y muestra el modal de confirmación.
  const handleOpenDialog = (id: string) => {
    setSelectedAppointmentId(id); // Guarda el ID de la cita seleccionada
    setOpenDialog(true); // Abre el diálogo de confirmación
  };

  // Cierra el diálogo de confirmación y restaura el foco al cuerpo del documento tras la animación para mantener la accesibilidad.
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(() => {
      if (document.body) {
        document.body.focus();
      }
    }, 1000);
  };


// Funcion para manejar la cancelación de la cita
const handleCancelAppointment = async (id: string) => {
  if(!selectedAppointmentId) return; // Asegura que hay una cita seleccionada antes de proceder
  setLoadingConfirm(true); // Indica que se está procesando la cancelación
  try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No hay token de autenticación');
      await cancelarCita(id);
      setCitas(prev => prev.filter(cita => cita.id !== id));
      setOpenDialog(false);
  } catch (error) {
      console.error('Error al cancelar la cita:', error);
  }
  setLoadingConfirm(false);
  setSelectedAppointmentId(null);
};

useEffect(() => {
  async function Obtener() {

    await getCitas().then(resp => setCitas(resp));

    setLoadingCitas(false);
  }
  Obtener();
}, []);

if (loadingCitas) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress sx={{ color: '#486238' }} />
    </Box>
  );
}
return (
  <>
    {/* Contenedor principal */}
    <Container sx={{ py: 2, px: 2 }} maxWidth="lg">
      {/* Barra de título */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} px={4}>
        <Typography variant="h6" fontWeight={600} sx={{ color: '#486238' }}>
          Mis Citas Agendadas
        </Typography>
      </Box>

      {/* Grid de citas */}
      <Grid container spacing={3} mb={3} px={4}>
        {citasOrdenadas.length > 0 ? (
          citasOrdenadas.map((item: Cita) => (
            <Grow key={item.id} in style={{ transformOrigin: '0 0 0' }} {...({ timeout: 1000 })}>
              <Grid
                size={{ xs: 12, sm: 6, md: 4 }}
                display="flex"
                justifyContent="center"
                sx={{
                  flex: '1 1 100%',
                  minWidth: '320px',
                  display: 'flex',
                  justifyContent: 'center',
                  mb: { xs: 12, md: 8 },
                  '@media (min-width: 900px)': {
                    flex: '1 1 48%',
                    maxWidth: '48%',
                  },
                }}
              >
                <Box justifyItems={'center'} alignItems={'center'}>
                  {/* DISEÑO ORIGINAL DE TU CARD RESTAURADO */}
                  <Card
                    sx={{
                      maxWidth: 450,
                      borderRadius: 4,
                      boxShadow: 3,
                      overflow: 'hidden',
                      background: 'linear-gradient(to right, #fff, #f5f5f5)',
                      p: 3,
                      border: '3px dashed #ccc',
                    }}
                  >
                    <Box textAlign="center" mb={2}>
                      <Typography variant="h4">Pase de entrada</Typography>
                      <Divider sx={{ my: 2 }} />
                    </Box>

                    <Grid container spacing={1} mt={3}>
                      <Grid size={{ md: 3, xs: 12 }} textAlign={'center'}>
                        <Typography variant="subtitle1" sx={{ color: '#555' }} fontWeight={'bold'}>Fecha:</Typography>
                      </Grid>
                      <Grid size={{ md: 9, xs: 12 }}>
                        <Typography variant="subtitle1" sx={{ color: '#555' }}>
                          {format(new Date(item.inicio), "d 'de' MMMM 'del' yyyy 'a las' HH:mm", { locale: es })}
                        </Typography>
                      </Grid>

                      <Grid size={{ md: 3, xs: 12 }} textAlign={'center'}>
                        <Typography variant="subtitle1" sx={{ color: '#555' }} fontWeight={'bold'}>Oficina:</Typography>
                      </Grid>
                      <Grid size={{ md: 9, xs: 12 }}>
                        <Typography variant="subtitle1" sx={{ color: '#555' }}>{item.oficina_descripcion}</Typography>
                      </Grid>

                      <Grid size={{ md: 3, xs: 12 }} textAlign={'center'}>
                        <Typography variant="subtitle1" sx={{ color: '#555' }} fontWeight={'bold'}>Servicio:</Typography>
                      </Grid>
                      <Grid size={{ md: 9, xs: 12 }}>
                        <Typography variant="subtitle1" sx={{ color: '#555' }}>{item.cit_servicio_descripcion}</Typography>
                      </Grid>

                      <Grid size={{ md: 3, xs: 12 }} textAlign={'center'}>
                        <Typography variant="subtitle1" sx={{ color: '#555' }} fontWeight={'bold'}>Notas:</Typography>
                      </Grid>
                      <Grid size={{ md: 9, xs: 12 }}>
                        <Typography variant="subtitle1" sx={{ color: '#555' }}>
                          {item.notas ? item.notas.slice(0, 35) + (item.notas.length > 35 ? '...' : '') : 'Sin notas'}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box my={3} display="flex" justifyContent="center">
                      <img alt="qr" src={item.codigo_acceso_url} width={200} />
                    </Box>

                    <Typography
                      variant="caption"
                      display="block"
                      textAlign="center"
                      mt={1}
                      onClick={() => handleOpenDialog(item.id)}
                      sx={{ color: '#555', cursor: 'pointer' }} // Añadido cursor pointer
                    >
                      Código: <br /> {item.id}
                    </Typography>

                    <CardActions>
                      {item.puede_cancelarse && (
                        <Button sx={{ mt: 1 }} variant="outlined" color="error" fullWidth onClick={() => handleOpenDialog(item.id)}>
                          Cancelar
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Box>
              </Grid>
            </Grow>
          ))
        ) : (
          /* Estado vacío: se muestra cuando no hay citas */
          <Box width="100%" textAlign="center" py={6}>
            <Avatar sx={{ bgcolor: '#b1c89e', width: 56, height: 56, margin: '0 auto' }}>
              <CalendarMonthIcon sx={{ color: 'white' }} />
            </Avatar>
            <Typography variant="h6" mt={2}>
              No tienes citas agendadas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Agenda una nueva cita para comenzar
            </Typography>
          </Box>
        )}
      </Grid>

      {/* DIÁLOGO DE CONFIRMACIÓN */}
      <Dialog open={openDialog} onClose={loadingConfirm ? undefined : handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <EventBusy sx={{ color: 'error.main', mr: 1.5 }} />
            <Typography variant="h6" fontWeight="bold">Cancelar Cita</Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} disabled={loadingConfirm}><CloseIcon /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <WarningAmberIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
            <Typography align="center" variant="subtitle1" fontWeight={500}>
              ¿Estás seguro que deseas cancelar tu cita?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined" color="inherit" disabled={loadingConfirm}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if(selectedAppointmentId) handleCancelAppointment(selectedAppointmentId);
            }}
            variant="contained"
            color="error"
            sx={{ ml: 2, minWidth: 120 }}
            disabled={loadingConfirm}
          >
            {loadingConfirm ? <CircularProgress size={22} color="inherit" /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>

    {/* FOOTER (Fuera del Container para que ocupe todo el ancho) */}
    <Box component="footer"
      sx={{
        mt: 4,
        py: 3,
        bgcolor: '#fff',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: citasOrdenadas.length <= 2 ? 'fixed' : 'relative', // Dinámico si hay pocas citas
        bottom: 0,
        width: '100%'
      }}
    >
      <img src="/images/logo-horizontal-600x200-negro.png" alt="Logo PJECZ" style={{ width: 220, height: 'auto' }} />
    </Box>
  </>
)};

export default HomePage;
