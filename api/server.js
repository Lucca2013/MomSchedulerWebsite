import app from '../src/app/app.js';

export default function handler(req, res) {
  return app(req, res);
}