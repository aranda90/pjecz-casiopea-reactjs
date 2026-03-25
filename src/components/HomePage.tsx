import React, { useState, useEffect } from 'react';
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
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [activeView, setActiveView] = useState<'list' | 'new'>('list');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [loadingCancelId, setLoadingCancelId] = useState<string | null>(null);


  useEffect(() => {
    getCitas()
      .then(setCitas)
      .catch(() => setCitas([]))
      .finally(() => setLoadingCitas(false));
  }, []);

  // Funcion para abrir el dialogo de confirmación de cancelación
  const handleOpenDialog = (id: string) => {
    setSelectedAppointmentId(id); // Guarda el ID de la cita seleccionada
    setOpenDialog(true); // Abre el diálogo de confirmación
  };
  
  // Funcion para cerrar el dialogo de confirmación de cancelación
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
  setLoadingCancelId(id); 
  try { 
      const token = localStorage.getItem('access_token'); 
      if (!token) throw new Error('No hay token de autenticación'); 
      await cancelarCita(id); setCitas(prev => prev.filter(cita => cita.id !== id)); 
      setOpenDialog(false); 
  } catch (error) { 
      setOpenDialog(false); } setLoadingCancelId(null); 
};

// Renderizado de la vista de la lista de citas
if (activeView === 'list') {
  return (
    <>
      {/* Contenedor principal */}
      <Container sx={{ py: 2, px: 2 }} maxWidth="lg" >
        {/* Barra de título */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} px={4}>
          <Typography variant="h6" fontWeight={600} sx={{ color: '#486238' }}>Mis Citas Agendadas</Typography>
        </Box>
        {/* Grid de citas */}
        <Grid container spacing={3} mb={3} px={4}>
          {/* Ordenar las citas por fecha y hora ascendente antes de renderizar */}
          {[...citas]
            // Mostrar todas las citas (futuras y pasadas)
            .sort((a, b) => {
              // Parsear la fecha y hora desde la propiedad 'inicio' (formato ISO)
              const dateA = Date.parse(a.inicio);
              const dateB = Date.parse(b.inicio);
              // Orden ascendente: más antigua primero
              return dateA - dateB;
            })
            .map((item: Cita) => (
              <Grow
                key={item.id}
                in
                style={{ transformOrigin: '0 0 0' }}
                {...( { timeout: 1000 } )}
              >
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
                        <Typography variant="h4">
                            Pase de entrada
                        </Typography>

                        <Divider sx={{ my: 2 }} />
                      </Box>

                      <Grid container spacing={1} mt={3}>

                        <Grid size={{ md: 3, xs: 12 }} textAlign={'center'}>
                          <Typography variant="subtitle1" sx={{ color: '#555' }} fontWeight={'bold'}>Fecha:</Typography>
                        </Grid>

                        <Grid size={{ md: 9, xs: 12 }}>
                          <Typography variant="subtitle1" sx={{ color: '#555' }}>{format(new Date(item.inicio), "d 'de' MMMM 'del' yyyy 'a las' HH:mm", { locale: es })}</Typography>
                        </Grid>

                        <Grid size={{ md: 3, xs: 12 }} textAlign={'center'}>
                            <Typography variant="subtitle1" sx={{ color: '#555' }} fontWeight={'bold'}>Oficina:</Typography>
                        </Grid>

                        <Grid size={{ md: 9, xs: 12 }}>
                            <Typography variant="subtitle1" sx={{ color: '#555' }}>{item.oficina_descripcion} </Typography>
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
                          <Typography variant="subtitle1" sx={{ color: '#555' }}>{item.notas ? item.notas.slice(0, 35 ) + (item.notas.length > 35 ? '...' : '') : 'Sin notas'}</Typography>
                        </Grid>

                      </Grid>

                      <Box my={3} display="flex" justifyContent="center">
                        <img
                          alt="qr"
                          src={item.codigo_acceso_url}
                          width={200}
                        />

                      </Box>

                      <Typography
                            variant="caption"
                            display="block"
                            textAlign="center"
                            mt={1}
                            onClick={() => handleOpenDialog(item.id)}
                            sx={{ color: '#555' }}
                        >
                          Código: <br /> {item.id}
                        </Typography>

                      <CardActions>
                        {item.puede_cancelarse && (
                          <Button sx={{ mt: 1}} variant="outlined" color="error" fullWidth onClick={() => handleOpenDialog(item.id)}>Cancelar</Button>
                        )}
                      </CardActions>

                    </Card>

                    </Box>

                  
                </Grid>
              </Grow>
              ))}
          
          </Grid>

          {/* Filtra solo las citas futuras */}
          {citas.length === 0 && (
            <Box width="100%" textAlign="center" py={6}>
              <Avatar sx={{ bgcolor: '#b1c89e', width: 56, height: 56, margin: '0 auto' }}>
                <CalendarMonthIcon sx={{ color: 'gray.500' }} />
              </Avatar>
              <Typography variant="h6" mt={2}>
                  No tienes citas agendadas
              </Typography>
              <Typography variant="body1" color="text.secondary">
                  Agenda una nueva cita para comenzar
              </Typography>
            </Box>
          )}
            
        {/* Fin de la pantalla de citas */}
        <Box mt={4} textAlign="center">
          <Dialog 
            open={openDialog} 
            onClose={loadingConfirm ? undefined : handleCloseDialog} 
            fullWidth 
            maxWidth="xs"
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center">
                <EventBusy sx={{ color: 'error.main', mr: 1.5 }} />
                <Typography variant="h6" fontWeight="bold">
                  Cancelar Cita
                </Typography>
              </Box>
              <IconButton 
                onClick={handleCloseDialog} 
                sx={{ color: 'text.secondary' }}
                disabled={loadingConfirm}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            {/* Fin del dialogo de cancelar cita */}
            <Divider />
            {/* Fin del dialogo de cancelar cita */}
            <DialogContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mt: 2,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'warning.light',
                    color: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    mb: 2,
                  }}
                >
                  <WarningAmberIcon fontSize="large" />
                </Box>
                <Typography align="center" variant="subtitle1" fontWeight={500}>
                  ¿Estás seguro que deseas cancelar tu cita?
                </Typography>
              </Box>
            </DialogContent>
            {/* Fin del dialogo de cancelar cita */}
            <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
              <Button 
                onClick={handleCloseDialog} 
                variant="outlined" 
                color="inherit"
                disabled={loadingConfirm}
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (selectedAppointmentId !== null) {
                    setLoadingConfirm(true);
                    setTimeout(async () => {
                      await handleCancelAppointment(selectedAppointmentId);
                      setLoadingConfirm(false);
                      handleCloseDialog();
                    }, 2000);
                  }
                }}
                variant="contained"
                color="error"
                sx={{ ml: 2, minWidth: 120 }}
                autoFocus
                disabled={loadingConfirm}
              >
                {loadingConfirm ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Confirmar"
                )}
              </Button>
              
            </DialogActions>
          </Dialog>
          <Box component="footer" 
            sx={{
              position: 'fixed',
              left: 0,
              bottom: 0,
              width: '100%',
              bgcolor: '#fff',
              boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img src="/images/logo-horizontal-600x200-negro.png" alt="Logo PJECZ" style={{ width: 220, height: 'auto', marginBottom: 4 }} />
          </Box>
        </Box>
      </Container>
    </>
  );
}

return null; // Retorno necesario para cumplir con el tipo React.FC (evita retornar undefined)
};

export default HomePage;
