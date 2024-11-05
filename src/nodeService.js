const Service = require('node-windows').Service;

const servicio = new Service({
  name: 'nodeService',
  description: 'Parte del servidor del chat de terminal con Node',
  script: 'C:\\Users\\mnunez\\Documents\\GitHub\\simple-terminal-chat\\src\\server.js'
});

servicio.on('install', () => {
  servicio.start();
});

servicio.on('uninstall', () => {
  console.log('Servicio desinstalado');
});

servicio.install();
// servicio.uninstall();
