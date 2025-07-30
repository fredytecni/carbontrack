# CarbonTrack Básico

Este paquete contiene los archivos iniciales para el módulo de **Login, Registro y Dashboard** de su proyecto **CarbonTrack**.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
cd carbontrack_basic
npm install
npm start
```

El servidor se inicia en [http://localhost:3000](http://localhost:3000)

## Estructura

```
carbontrack_basic/
├── server.js
├── package.json
├── db.json          # Se genera automáticamente
├── public/
│   ├── css/style.css
│   └── js/app.js
├── views/
│   ├── index.html
│   ├── register.html
│   └── dashboard.html
└── models/          # Espacio para modelos futuros
```

## Próximos Pasos

1. Agregar gestión de empresas.
2. Implementar formulario de emisiones.
3. Cálculo de huella y gráficos dinámicos.
4. Exportar reportes a PDF/CSV.