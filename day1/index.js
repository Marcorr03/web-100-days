const fondosDisponibles = [
    { id: 1,imagen: "image1.jpg",},
    { id: 2,imagen: "image2.jpg",},
    { id: 3,imagen: "image3.png",},
    { id: 4,imagen: "image4.png",}
];

const fondoDinamico = document.getElementById('fondo-dinamico');
const ruleta = document.getElementById('ruleta');
let fondosEnCola = [];
let fondoActual = null;
let historial = [];

function inicializar() {
    fondosEnCola = mezclarArray([...fondosDisponibles]);
    actualizarRuleta();
    seleccionarFondo(fondosEnCola[0]);
}

function mezclarArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function actualizarRuleta() {
    ruleta.innerHTML = '';
    fondosEnCola.forEach((fondo, index) => {
        const elementoFondo = document.createElement('div');
        elementoFondo.className = `fondo-miniatura ${index === 0 ? 'seleccionado' : ''} animar-entrada`;
        elementoFondo.dataset.id = fondo.id;
        elementoFondo.style.animationDelay = `${index * 0.1}s`;
        const img = document.createElement('img');
        img.src = fondo.imagen;
        img.alt = fondo.nombre;
        elementoFondo.appendChild(img);
        ruleta.appendChild(elementoFondo);
        elementoFondo.addEventListener('click', () => {
            seleccionarFondo(fondo);
        });
    });
}

function seleccionarFondo(fondo) {
    fondoDinamico.style.backgroundImage = `url('${fondo.imagen}')`;
    if (fondoActual) historial.push(fondoActual);
    fondoActual = fondo;
    fondosEnCola = fondosEnCola.filter(f => f.id !== fondo.id);
    if (fondosEnCola.length < 3) {
        const nuevosFondos = fondosDisponibles
            .filter(f => !fondosEnCola.some(ff => ff.id === f.id) && f.id !== fondo.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        fondosEnCola.push(...nuevosFondos);
    }
    actualizarRuleta();
}

function fondoAnterior() {
    if (historial.length > 0) {
        const anterior = historial.pop();
        seleccionarFondo(anterior);
    }
}

function fondoSiguiente() {
    if (fondosEnCola.length > 0) {
        seleccionarFondo(fondosEnCola[0]);
    }
}

inicializar();