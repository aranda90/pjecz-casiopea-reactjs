// Importaciones principales de React, hooks y componentes de Material UI
import React, { useEffect, useState } from 'react';
// Hook para navegación entre rutas
import { useNavigate } from 'react-router-dom';
// Componentes de Material UI para el formulario y la interfaz de usuario
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Stack, Typography, InputAdornment, Alert, Card, CardContent, List, ListItemButton, ListItemIcon, ListItemText, Divider, CircularProgress, Avatar } from '@mui/material';
// Componentes de Material UI para el selector de fechas
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
// Adaptador para utilizar dayjs con los componentes de fecha de Material UI
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// Biblioteca dayjs para el manejo de fechas
import dayjs, { Dayjs } from 'dayjs';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BusinessIcon from '@mui/icons-material/Business';
import { AccessTime, Assignment } from '@mui/icons-material';
import NotesIcon from '@mui/icons-material/Notes';
import DeleteIcon from '@mui/icons-material/Delete';
import { getDistritos, getOficinasFiltradas, getFechasDisponibles, getHorasDisponibles, getServiciosPorOficina, createCita, Distrito } from '../actions/CitasActions';

// Tipos para las oficinas y servicios
type Oficina = { 
  clave: string; 
  descripcion: string; 
  descripcion_corta: string; 
  domicilio_clave: string; 
  domicilio_completo: string; 
  domicilio_edificio: string; 
  es_jurisdiccional: boolean 
};
type OficinaServicio = { 
  cit_servicio_clave: string; 
  cit_servicio_descripcion: string 
};

// Componente principal para agendar citas
const NewAppointment: React.FC = () => {
  // Estados para los campos del formulario y mensajes
  const [distrito, setDistrito] = useState(''); // Distrito seleccionado
  const [oficina, setOficina] = useState<Oficina | null>(null); // Oficina seleccionada
  const [tramite, setTramite] = useState(''); // Trámite/servicio seleccionado
  const [notas, setNotas] = useState(''); // Notas adicionales
  const [expedientes, setExpedientes] = useState<string[]>(['']); // Inputs para expedientes separados
  const [fecha, setFecha] = useState<Dayjs | null>(null); // Fecha seleccionada
  const [hora, setHora] = useState(''); // Hora seleccionada
  
  const [error, setError] = useState<string | null>(null); // Mensaje de error general
  const [successMsg, setSuccessMsg] = useState<string | null>(null); // Mensaje de éxito
  const [countdown, setCountdown] = useState(3); // Contador para el envío
  const navigate = useNavigate(); // Hook para navegación

  // Estados para la carga de distritos
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [loadingDistritos, setLoadingDistritos] = useState(true);
  const [errorDistritos, setErrorDistritos] = useState<string | null>(null);

  // Estados para la carga de oficinas
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [loadingOficinas, setLoadingOficinas] = useState(true);
  const [errorOficinas, setErrorOficinas] = useState<string | null>(null);

  // Estados para los trámites/servicios
  const [tramites, setTramites] = useState<OficinaServicio[]>([]);
  const [loadingTramites, setLoadingTramites] = useState(false);
  const [errorTramites, setErrorTramites] = useState<string | null>(null);

  // Estados para fechas disponibles
  const [fechas, setFechas] = useState<string[]>([]);
  const [loadingFechas, setLoadingFechas] = useState(false);
  const [errorFechas, setErrorFechas] = useState<string | null>(null);

  // Estados para horas disponibles y envío
  const [horas, setHoras] = useState<string[]>([]);
  const [loadingHoras, setLoadingHoras] = useState(false);
  
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Carga inicial de distritos
  useEffect(() => {
    setLoadingDistritos(true);
    getDistritos()
      .then(res => setDistritos(Array.isArray(res) ? res : []))
      .catch(() => setErrorDistritos('No se pudieron cargar los distritos.'))
      .finally(() => setLoadingDistritos(false));
  }, []);

  // Cargar oficinas cuando se selecciona un distrito
  useEffect(() => {
    setOficina(null);
    setTramite('');
    setTramites([]);
    setFechas([]);
    setHoras([]);

    if (!distrito) return;

    setLoadingOficinas(true);
    setErrorOficinas(null);
    getOficinasFiltradas(distrito)
      .then(res => setOficinas(Array.isArray(res) ? res : []))
      .catch(() => setErrorOficinas('No se pudieron cargar las oficinas para este distrito.'))
      .finally(() => setLoadingOficinas(false));
  }, [distrito]);

  // Cargar servicios al cambiar de oficina
  useEffect(() => {
    setTramite('');
    setTramites([]);
    setFechas([]);
    setHoras([]);

    if (!oficina) return;
    setLoadingTramites(true);
    setErrorTramites(null);
    getServiciosPorOficina(oficina.clave)
      .then(data => setTramites(data))
      .catch(() => setErrorTramites('No se pudieron cargar los trámites.'))
      .finally(() => setLoadingTramites(false));
  }, [oficina]);

  // Cargar fechas disponibles para el trámite/oficina seleccionados
  useEffect(() => {
    setFecha(null);
    setFechas([]);
    setHoras([]);

    if (!oficina || !tramite) return;
    setLoadingFechas(true);
    setErrorFechas(null);
    getFechasDisponibles(oficina.clave, tramite)
      .then(res => setFechas(Array.isArray(res) ? res : []))
      .catch(() => setErrorFechas('No se pudieron cargar las fechas.'))
      .finally(() => setLoadingFechas(false));
  }, [oficina, tramite]);

  // Cargar horas disponibles para la fecha seleccionada
  useEffect(() => {
    setHora('');
    setHoras([]);

    if (!oficina || !tramite || !fecha) return;
    setLoadingHoras(true);
    getHorasDisponibles(oficina.clave, tramite, fecha.format('YYYY-MM-DD'))
      .then(res => setHoras(Array.isArray(res) ? res : []))
      .catch(() => setError('No se pudieron cargar las horas.'))
      .finally(() => setLoadingHoras(false));
  }, [oficina, tramite, fecha]);

  // Redirigir a /homepage después de éxito al agendar cita con countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (successMsg && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (successMsg && countdown === 0) {
      navigate('/homepage');
    }
    return () => clearTimeout(timer);
  }, [successMsg, countdown, navigate]);

  // Detecta si el trámite seleccionado es de expedientes
  const isExpedientesTramite = () => {
    if (!tramite) return false;
    const tramiteObj = tramites.find(t => t.cit_servicio_clave === tramite);
    return tramiteObj && tramiteObj.cit_servicio_descripcion.toLowerCase().includes('expediente');
  };

  // Maneja el envío del formulario de nueva cita
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    
    // Validación de campos obligatorios
    if (!oficina || !tramite || !fecha || !hora) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    
    setLoadingSubmit(true);

    try {
      // Construye el payload para la API
      const payload = {
        cit_servicio_clave: tramite,
        fecha: fecha.format('YYYY-MM-DD'),
        hora_minuto: dayjs(`${fecha.format('YYYY-MM-DD')}T${hora}`).format('HH:mm:ss'),
        oficina_clave: oficina.clave,
        notas: isExpedientesTramite()
          ? expedientes.filter(e => e.trim() !== '').join(',') || 'Sin expedientes'
          : notas.trim() || 'Sin notas',
      };
      // Llama a la API para crear la cita
      await createCita(payload);
      setSuccessMsg('¡Cita agendada correctamente!');
      setCountdown(3); // Reiniciar countdown
      setOficina(null);
      setTramite('');
      setNotas('');
      setExpedientes(['']);
      setFecha(null);
      setHora('');
    } catch (e: any) {
      setError(e?.message || 'Error al agendar cita.');
    } finally {
      setTimeout(() => setLoadingSubmit(false), 1500);
    }
  };


  // Render principal del formulario de agendar cita
  return (
    <Box maxWidth={800} mx="auto" mt={4} mb={16}>
      <Card elevation={6} sx={{ borderRadius: 3 }}>
        <CardContent>
          {/* Título del formulario */}
          <img src="images/logo-sistema-citas.png" alt="Logo PJECZ" style={{ width: 80, height: 80, margin: '0 auto', display: 'block' }} />
          <Typography variant="h5" fontWeight="bold" mb={3} align="center" sx={{ color: '#486238' }}>
            Agendar cita
          </Typography>
          {/* Formulario controlado */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Selector de distrito */}
              <FormControl fullWidth>
                <InputLabel id="distrito-label">Distrito</InputLabel>
                <Select
                  labelId="distrito-label"
                  value={distrito}
                  label="Distrito"
                  displayEmpty
                  onChange={e => setDistrito(e.target.value)}
                  startAdornment={<InputAdornment position="start" sx={{ color: '#648059' }}><LocationCityIcon sx={{ color: '#648059' }} /></InputAdornment>}
                  disabled={loadingDistritos || !!errorDistritos}
                >
                  {/* Opción inicial (placeholder) */}
                  <MenuItem value="" disabled>
                    <em style={{ color: 'gray.200' }}>{loadingDistritos ? 'Cargando distritos...' : errorDistritos ? errorDistritos : 'Seleccione un distrito'}</em>
                  </MenuItem>
                  {/* Lista de distritos */}
                  {distritos.map((distritoItem) => (
                    <MenuItem key={distritoItem.clave} value={distritoItem.clave}>
                      {distritoItem.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Selector de oficina */}
              <FormControl fullWidth>
                <InputLabel id="oficina-label">Oficina</InputLabel>
                <Select
                  labelId="oficina-label"
                  value={oficina?.clave || ''}
                  label="Oficina"
                  displayEmpty
                  onChange={e => {
                    const selected = oficinas.find(oficina => oficina.clave === e.target.value) || null;
                    setOficina(selected)}}
                  startAdornment={<InputAdornment position="start" sx={{ color: '#648059' }}><BusinessIcon /></InputAdornment>}
                  disabled={!distrito || loadingOficinas || !!errorOficinas}
                >
                  {/* Opción inicial (placeholder) */}
                  <MenuItem value="" disabled>
                    <em style={{ color: 'gray.200' }}>{loadingOficinas ? 'Cargando oficinas...' : errorOficinas ? errorOficinas : 'Seleccione una oficina'}</em>
                  </MenuItem>
                  {/* Lista de oficinas */}
                  {oficinas.map((oficinaItem) => (
                    <MenuItem key={oficinaItem.clave} value={oficinaItem.clave}>
                      {oficinaItem.descripcion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Selector de trámite */}
              <FormControl fullWidth>
                <InputLabel id="tramite-label">Trámite</InputLabel>
                <Select
                  labelId="tramite-label"
                  label="Trámite"
                  value={tramite === null ? '' : tramite}
                  onChange={e => setTramite(e.target.value === '' ? '' : e.target.value)}
                  fullWidth
                  displayEmpty
                  disabled={loadingTramites || !!errorTramites || !oficina}
                  startAdornment={<InputAdornment position="start" sx={{ color: '#648059' }}><Assignment /></InputAdornment>}
                >
                  {/* Opción inicial (placeholder) */}
                  <MenuItem value="" disabled>
                    <em style={{ color: 'gray' }}>{loadingTramites ? 'Cargando trámites...' : errorTramites ? errorTramites : 'Selecciona un trámite'}</em>
                  </MenuItem>
                  {/* Lista de trámites */}
                  {tramites.map((t) => (
                    <MenuItem key={t.cit_servicio_clave} value={t.cit_servicio_clave}>
                      {t.cit_servicio_descripcion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Campo de notas o expedientes */}
              {isExpedientesTramite() ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>Expedientes</Typography>
                  <Stack spacing={1}>
                    {expedientes.map((exp, idx) => (
                      <Stack direction="row" spacing={1} alignItems="center" key={idx}>
                        <TextField
                          label={`Expediente ${idx + 1}`}
                          value={exp}
                          onChange={e => {
                            const newExps = [...expedientes];
                            newExps[idx] = e.target.value;
                            setExpedientes(newExps);
                          }}
                          fullWidth
                        />
                        {expedientes.length > 1 && (
                          <Button color="error" onClick={() => {
                            setExpedientes(expedientes.filter((_, i) => i !== idx));
                          }} startIcon={<DeleteIcon />}/>
                        )}
                      </Stack>
                    ))}
                    <Button
                      variant="outlined"
                      onClick={() => setExpedientes([...expedientes, ''])}
                      sx={{ mt: 1, color: '#648059' }}
                    >
                      Agregar más expedientes
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <TextField
                  label="Notas"
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start" sx={{ color: '#648059' }}><NotesIcon /></InputAdornment>
                    }
                  }}
                />
              )}
              {/* Sección de fecha y hora */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {/* Selector de fecha usando DateCalendar */}
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1} sx={{ color: '#648059', mx: 2 }}>Selecciona una fecha</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                      value={fecha}
                      onChange={newDate => setFecha(newDate ? dayjs(newDate) : null)}
                      shouldDisableDate={date => {
                        const fechaString = dayjs(date).format('YYYY-MM-DD');
                        const hoyString = dayjs().format('YYYY-MM-DD');
                        if(fechaString === hoyString) return false; // Permitir seleccionar el día actual
                        if (loadingFechas || errorFechas) return true;
                        return !fechas.includes(dayjs(date).format('YYYY-MM-DD'));
                      }}
                      disabled={loadingFechas || !!errorFechas || !tramite}
                    />
                  </LocalizationProvider>
                </Box>
                {/* Selector de hora disponible */}
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1} sx={{ color: '#648059' }}>Selecciona una hora</Typography>
                  <Card variant="outlined" sx={{ p: 1, height: 280, overflowY: 'auto' }}>
                    {loadingHoras ? (
                      // Estado de carga para las horas
                      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={180}>
                        <CircularProgress size={64} thickness={5} sx={{ color: '#5f8169' }} />
                        <Typography mt={2} sx={{ color: '#5f8169' }} fontWeight="bold">Cargando horas disponibles...</Typography>
                      </Box>
                    ) : (
                      // Lista de horas disponibles
                      <List dense sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                        {horas.length === 0 && (
                          <ListItemText primary="No hay horas disponibles" sx={{ textAlign: 'center', color: 'gray' }} />
                        )}
                        {horas.map((horaItem) => (
                          <ListItemButton
                            key={horaItem}
                            selected={hora === horaItem}
                            onClick={() => setHora(horaItem)}
                            sx={{ borderRadius: 2, mb: 1 }}
                          >
                            <ListItemIcon>
                              <AccessTime color={hora === horaItem ? 'inherit' : 'disabled'} />
                            </ListItemIcon>
                            <ListItemText primary={horaItem} />
                          </ListItemButton>
                        ))}
                      </List>
                    )}
                  </Card>
                </Box>
              </Stack>
              {/* Mensajes de error y éxito */}
              {error && <Alert severity="error">{error}</Alert>}
              {successMsg && (
                <Alert severity="success">
                  {successMsg}
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Redirigiendo en {countdown} segundo{countdown !== 1 ? 's' : ''}...
                  </Typography>
                </Alert>
              )}
              <Divider sx={{ my: 2 }} />
              {/* Botón de envío del formulario */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 2, color: 'white', backgroundColor: '#70815c' }}
                fullWidth
                disabled={loadingSubmit}
              >
                {loadingSubmit ? <CircularProgress size={24} color="inherit" /> : "Agendar cita"}
              </Button>
            </Stack>
          </form>
         {/* <Box component="footer"
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
          </Box> */}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NewAppointment;
