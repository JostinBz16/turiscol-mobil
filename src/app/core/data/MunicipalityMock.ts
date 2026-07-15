import { Municipality } from '../models/Municipality';

export const destinations: Municipality[] = [
  {
    id: 1,
    name: 'Cartagena',
    department: { id: 4, name: 'Bolívar' },
    imageUrl:
      'https://mlqfmr3rpryd.i.optimole.com/cb:JBSP.a525/w:auto/h:auto/q:100/ig:avif/https://cartagena-tours.co/wp-content/uploads/2023/12/Torre-del-Reloj-en-Cartagena-de-Indias-Colombia.jpg',
  },
  {
    id: 2,
    name: 'Medellín',
    department: { id: 1, name: 'Antioquia' },
    imageUrl: 'https://www.minuto30.com/wp-content/uploads/2020/01/medellin.jpg',
  },
  {
    id: 3,
    name: 'Bogotá',
    department: { id: 2, name: 'Cundinamarca' },
    imageUrl:
      'https://desarrolloeconomico.gov.co/wp-content/uploads/2023/05/167_Colpatria8_RicardoBaez_small.jpg',
  },
  {
    id: 4,
    name: 'Santa Marta',
    department: { id: 5, name: 'Magdalena' },
    imageUrl:
      'https://www.santamarta.gov.co/sites/default/files/el_rodadero_web.jpg?fid=27409',
  },
  {
    id: 5,
    name: 'Bucaramanga',
    department: { id: 6, name: 'Santander' },
    imageUrl:
      'https://www.hotelrivieraplaza.com/wp-content/uploads/2022/07/bucaramanga-de-noche-santander-colombia.jpg',
  },
  {
    id: 6,
    name: 'Bello',
    department: { id: 1, name: 'Antioquia' },
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/50/Bello_Antioquia.jpg',
  },
  {
    id: 7,
    name: 'Cali',
    department: { id: 3, name: 'Valle del Cauca' },
    imageUrl:
      'https://www.cali.gov.co/info/caligovco_se/media/pubInt/thumbs/thpubInt_700X400_186322.webp',
  },
];
