export default function checkAuth(req, res, next) {
  if (req.authenticate()) next();
  else res.status(401).json({ error: "No authenticated" });
}
