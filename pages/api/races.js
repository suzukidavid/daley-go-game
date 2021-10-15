// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {listRace} from "../../libs/race"

export default async function handler(req, res) {
  const races = await listRace();
  res.status(200).json(races);
}
