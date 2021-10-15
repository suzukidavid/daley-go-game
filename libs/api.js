const DOMAIN = process.env.DOMAIN || 'http://localhost:3000'

export async function getRaces() {
  var response = await fetch(`${DOMAIN}/api/races`);
  var races = await response.json();
  return races;
}

export async function getRace(id) {
  var response = await fetch(`${DOMAIN}/api/race/${id}`);
  var race = await response.json();
  return race;
}