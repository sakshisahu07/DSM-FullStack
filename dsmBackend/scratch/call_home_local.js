async function run() {
  const res = await fetch("http://localhost:5050/api/v1/home");
  const json = await res.json();
  console.log("Response:", json);
}

run();
