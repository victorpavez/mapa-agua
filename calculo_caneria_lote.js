// calculo_caneria_lote.js

// 🔵 Capa de la ruta animada
let rutaAnimada = L.polyline([], { color: "blue", weight: 4 }).addTo(map);

function nodoMasCercano(punto, nodos) {
  let minDist = Infinity;
  let nodoCercano = null;

  nodos.features.forEach(n => {
    const coord = n.geometry.coordinates;
    const dist = Math.hypot(coord[0] - punto[0], coord[1] - punto[1]);
    if (dist < minDist) {
      minDist = dist;
      nodoCercano = coord;
    }
  });

  return nodoCercano;
}

function mostrarRutaDesde(punto) {
  if (!window.nodosMedios || !window.nodosAgua || !window.nodosVertices) return;

  const inicio = nodoMasCercano(punto, window.nodosMedios);
  const fin = nodoMasCercano(inicio, window.nodosAgua);

  // 🔄 Animar ruta como ejemplo recto (solo demostrativo, reemplazar por algoritmo real)
  rutaAnimada.setLatLngs([]);
  const pasos = [inicio, fin];

  let i = 0;
  const intervalo = setInterval(() => {
    if (i >= pasos.length) return clearInterval(intervalo);
    rutaAnimada.addLatLng([pasos[i][1], pasos[i][0]]);
    i++;
  }, 300);
}

// ⬇️ Escuchar clic en lote
map.on("click", (e) => {
  geojsonLayer.eachLayer(layer => {
    if (layer.getBounds().contains(e.latlng)) {
      const centroide = layer.getBounds().getCenter();
      mostrarRutaDesde([centroide.lng, centroide.lat]);
      layer.setStyle({ color: "orange", weight: 3 });
    }
  });
});
