async function getCoordinates(pincode) {
  const url = `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&limit=1`;
  const response = await fetch(url, { headers: { 'User-Agent': 'DSMElectro/1.0' } });
  const data = await response.json();
  console.log(data);
}
getCoordinates('462022');
console.log(t1);
console.log(t2);
}
run();
