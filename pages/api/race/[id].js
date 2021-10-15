// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {getRace} from "../../../libs/race"

export default async function handler(req, res) {
  var r = await getRace(req.query.id);
  res.status(200).json(r);
}
