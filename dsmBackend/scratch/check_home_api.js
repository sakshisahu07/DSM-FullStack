async function check() {
  const res = await fetch('http://localhost:5050/api/v1/home');
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
check();
