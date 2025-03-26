// script.js

const map = L.map("map", { zoomControl: false }).setView([-37.403, -68.931], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  maxZoom: 20,
}).addTo(map);

let geojsonOriginal, geojsonLayer, capaAgua, rutaLayer;
let nodosMedio = [], nodosAgua = [], nodosVertices = [];

fetch("AGUSIONO.geojson")
  .then(res => res.json())
  .then(data => {
    geojsonOriginal = data;
    actualizarMapa();
  })
  .catch(err => console.error("Error cargando GeoJSON:", err));

Promise.all([
  fetch("NODOSMEDIOS.geojson").then(res => res.json()),
  fetch("NODOSAGUA.geojson").then(res => res.json()),
  fetch("NODOSVERTICES.geojson").then(res => res.json()),
]).then(([medios, aguas, vertices]) => {
  nodosMedio = medios.features.map(f => ({ id: f.properties.id, coords: f.geometry.coordinates }));
  nodosAgua = aguas.features.map(f => ({ id: f.properties.id, coords: f.geometry.coordinates }));
  nodosVertices = vertices.features.map(f => ({ id: f.properties.id, coords: f.geometry.coordinates }));
  console.log("✅ Nodos cargados correctamente");
});

function actualizarMapa() {
  if (!geojsonOriginal) return;
  if (geojsonLayer) geojsonLayer.remove();

  const distancia = "agua_40m";
  const mostrarSinID = document.getElementById("mostrarSinID").checked;
  const filtro = document.getElementById("filter").value;

  let total = 0, conAgua = 0, sinAgua = 0, sinID = 0, sinAguaSinID = 0, conAguaSinID = 0;

  geojsonLayer = L.geoJSON(geojsonOriginal, {
    filter: f => {
      if (filtro === "agua") return f.properties[distancia] === "SI";
      if (filtro === "sinagua") return f.properties[distancia] === "NO";
      return true;
    },
    style: feature => {
      const props = feature.properties;
      const tieneID = props.id_lote !== null && props.id_lote !== undefined;
      const agua = props[distancia] === "SI";

      total++;
      if (!tieneID) sinID++;
      if (agua) {
        conAgua++;
        if (!tieneID) conAguaSinID++;
      } else {
        sinAgua++;
        if (!tieneID) sinAguaSinID++;
      }

      const color = !tieneID && mostrarSinID ? "gray" : agua ? "green" : "red";
      return { color, weight: 1, fillOpacity: 0.5 };
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      layer.bindPopup(
        `🆔 <b>ID:</b> ${p.id_lote ?? "(sin ID)"}<br>
        🏷️ <b>Número:</b> ${p.numero_lote ?? "-"}<br>
        🏡 <b>Manzana:</b> ${p.id_manzana ?? "-"}<br>
        💧 <b>Agua 40m:</b> ${p.agua_40m ?? "-"}`
      );

      layer.on("click", () => {
        if (p.agua_40m === "NO") mostrarRutaDesde(layer.getBounds().getCenter());
      });
    }
  }).addTo(map);

  const porcentaje = total > 0 ? ((conAgua / total) * 100).toFixed(1) : 0;
  const porcentajeSin = total > 0 ? (100 - porcentaje).toFixed(1) : 0;

  document.getElementById("totalLotes").textContent = total;
  document.getElementById("conAgua").textContent = `${conAgua} (${porcentaje}%)`;
  document.getElementById("sinAgua").textContent = `${sinAgua} (${porcentajeSin}%)`;
  document.getElementById("sinID").textContent = sinID;
  document.getElementById("sinAguaSinID").textContent = sinAguaSinID;
  document.getElementById("conAguaSinID").textContent = conAguaSinID;
}

function toggleCapaAgua() {
  const mostrar = document.getElementById("mostrarCapaAgua").checked;
  if (mostrar && !capaAgua) {
    fetch("AGUACAÑERIA.geojson")
      .then(res => res.json())
      .then(data => {
        capaAgua = L.geoJSON(data, {
          style: { color: "blue", weight: 2 }
        }).addTo(map);
      });
  } else if (!mostrar && capaAgua) {
    capaAgua.remove();
    capaAgua = null;
  }
}

document.getElementById("filter").addEventListener("change", actualizarMapa);
document.getElementById("mostrarSinID").addEventListener("change", actualizarMapa);
document.getElementById("mostrarCapaAgua").addEventListener("change", toggleCapaAgua);
document.getElementById("search").addEventListener("change", function () {
  const id = parseInt(this.value);
  if (!id || isNaN(id)) return;
  geojsonLayer.eachLayer(layer => {
    if (layer.feature.properties.id_lote == id) {
      map.fitBounds(layer.getBounds());
      layer.openPopup();
      layer.setStyle({ color: "orange", weight: 3, fillOpacity: 0.7 });
    }
  });
});
