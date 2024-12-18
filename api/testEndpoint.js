export default function handler(req, res) {
    if (req.method === "GET") {
      return res.status(200).json({ message: "GET request successful!" });
    } else if (req.method === "POST") {
      return res.status(200).json({ message: "POST request successful!", data: req.body });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  }
  