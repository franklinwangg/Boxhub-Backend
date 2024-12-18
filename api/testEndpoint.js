

export default function handler(req, res) {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Update with your frontend's origin
    res.setHeader('Access-Control-Allow-Origin', 'https://boxhub-h57jccbeh-franklin-wangs-projects.vercel.app/'); // Update with your frontend's origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allowed HTTP methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers


    if (req.method === "GET") {
      return res.status(200).json({ message: "GET request successful!" });
    } else if (req.method === "POST") {
      return res.status(200).json({ message: "POST request successful!", data: req.body });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  }
  