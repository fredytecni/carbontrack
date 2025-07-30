const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const pdfkit = require('pdfkit');
const fs = require('fs');

const app = express();
const adapter = new FileSync('db.json');
const db = Lowdb(adapter);

// Inicializar DB
db.defaults({ users: [], empresas: [], emisiones: [] }).write();

// Configuración
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'carbontracksecret',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rutas

// Página principal
app.get('/', (req, res) => {
  res.render('index');
});

// Registro
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  const exists = db.get('users').find({ email }).value();
  if (exists) return res.send('Usuario ya existe. <a href="/register">Volver</a>');
  db.get('users').push({ name, email, password }).write();
  res.redirect('/');
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.get('users').find({ email, password }).value();
  if (user) {
    req.session.user = user;
    return res.redirect('/dashboard');
  }
  res.send('Credenciales incorrectas. <a href="/">Volver</a>');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.render('dashboard');
});

// === EMPRESAS ===
app.get('/empresas', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const empresas = db.get('empresas').value();
  res.render('empresas', { empresas });
});

app.post('/empresas', (req, res) => {
  const { nombre, nit, sector } = req.body;
  const existe = db.get('empresas').find({ nit }).value();
  if (existe) {
    return res.send('⚠️ Empresa con ese NIT ya registrada. <a href="/empresas">Volver</a>');
  }
  db.get('empresas').push({ nombre, nit, sector }).write();
  res.redirect('/empresas');
});

// === EMISIONES ===
app.get('/emisiones', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  const empresas = db.get('empresas').value();
  res.render('emisiones', { empresas });
});

app.post('/emisiones', (req, res) => {
  const { empresa, fecha, alcance, tipo_gei, cantidad, fuente } = req.body;
  db.get('emisiones').push({ empresa, fecha, alcance, tipo_gei, cantidad, fuente }).write();
  res.redirect('/emisiones');
});

app.get('/emisiones-data', (req, res) => {
  const data = db.get('emisiones').value();
  res.json(data);
});

// === PDF con IA débil ===
app.get('/descargar-informe/:empresa', (req, res) => {
  const empresa = req.params.empresa;
  const emisiones = db.get('emisiones').filter({ empresa }).value();
  const total = emisiones.reduce((sum, e) => sum + Number(e.cantidad || 0), 0);

  let recomendacion = '';
  if (total > 100) {
    recomendacion = 'Esta empresa debería implementar planes de mitigación de GEI y reportar a MinAmbiente.';
  } else if (total > 50) {
    recomendacion = 'Podría adoptar políticas de eficiencia energética y reducción de emisiones indirectas.';
  } else {
    recomendacion = 'El nivel de emisiones es bajo. Se recomienda seguir monitoreando regularmente.';
  }

  const doc = new pdfkit();
  const filePath = path.join(__dirname, 'public', `${empresa}-informe.pdf`);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);
  doc.fontSize(18).text(`Informe de Emisiones - ${empresa}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Total de emisiones registradas: ${total} CO₂e`);
  doc.moveDown();
  doc.fontSize(12).text(`Recomendación basada en normativas colombianas:`);
  doc.fontSize(12).fillColor('green').text(recomendacion);
  doc.end();

  stream.on('finish', () => {
    res.download(filePath);
  });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


